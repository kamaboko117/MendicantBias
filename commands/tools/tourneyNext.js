const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { Round } = require('../../schemas/round');
const { Match } = require ('../../schemas/match');
const Tournament = require('../../schemas/tournament');
const mongoose = require('mongoose');

maxMatches= 4

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tourney_next')
        .setDescription('post next matches for tournament'),
    async execute(interaction, client) {
        tournamentProfile = await Tournament.findOne();
        roundProfile = await Round.findOne({
            name: tournamentProfile.currentBracket ?
                tournamentProfile.loserRounds[tournamentProfile.currentLoser].name :
                tournamentProfile.winnerRounds[tournamentProfile.currentWinner].name,
        })

        if (!tournamentProfile.open){
            tournamentProfile.open = true;
            await tournamentProfile.save().catch(console.error);
            await interaction.reply({
                content: `${roundProfile.name}: `
            });
        }else{
            //show previous day's results and close matches
            await interaction.reply({
                content: "last day's results:"
            });

            i = tournamentProfile.currentMatch - roundProfile.matches[0].matchId + 1;
            count = roundProfile.matches.length;
            count = count > maxMatches + i ? maxMatches + i : count;
        
            tournamentProfile.currentMatch += count - i;
            await tournamentProfile.save().catch(console.error); 
            for (; i < count; i++){
                matchProfile = await Match.findById(roundProfile.matches[i]);
                matchProfile.open = false;
                matchProfile.winner = matchProfile.votesRight > matchProfile.votesLeft ?
                    matchProfile.playerRight : matchProfile.playerLeft;
                matchProfile.loser = matchProfile.votesRight > matchProfile.votesLeft ?
                    matchProfile.playerLeft : matchProfile.playerRight;
                await matchProfile.save().catch(console.error);
                roundProfile.matches[i] = matchProfile;
                await roundProfile.save().catch(console.error);
                if (roundProfile.winnerBracket)
                    tournamentProfile.winnerRounds[tournamentProfile.currentWinner] = roundProfile;
                else
                    tournamentProfile.loserRounds[tournamentProfile.currentLoser] = roundProfile;
                await tournamentProfile.save().catch(console.error);
                if (matchProfile.playerRight){
                    
                    emote1 = roundProfile.matches[i].playerLeft.split(':')[2].slice(0, -1);
                    emote2 = roundProfile.matches[i].playerRight.split(':')[2].slice(0, -1);

                    const button1 = new ButtonBuilder()
                    .setCustomId(matchProfile._id + ' left')
                    .setStyle(ButtonStyle.Secondary)
                    .setLabel(`[${matchProfile.votesLeft}]`)
                    .setEmoji(emote1);
                    
                    const button2 = new ButtonBuilder()
                    .setCustomId(matchProfile._id + ' right')
                    .setStyle(ButtonStyle.Secondary)
                    .setLabel(`[${matchProfile.votesRight}]`)
                    .setEmoji(emote2);
                    interaction.channel.send({components: [
                        new ActionRowBuilder().addComponents(button1, button2)
                    ]})
                }else{
                    interaction.channel.send(`${i + 1} bye`)
                }
            }
            await tournamentProfile.save().catch(console.error);
            interaction.channel.send(`next matches:`)
        }

        //if round is over
        if (tournamentProfile.currentMatch == roundProfile.matches.length){
            
            //if previous round was winner bracket, next one has to be a loser
            if (roundProfile.winnerBracket){
                console.log(1)
                roundProfile = new Round({
                    _id: mongoose.Types.ObjectId(),
                    name: `LB${tournamentProfile.currentLoser + 1}`,        
                    winnerBraket: false,
                    // if this is the first loser bracket round, it should be minor
                    minor: tournamentProfile.currentLoser ? false : true,
                })
                roundProfile.numPlayers = roundProfile.minor ?
                    tournamentProfile.winnerRounds[tournamentProfile.currentWinner].numPlayers / 2 :
                    tournamentProfile.loserRounds[tournamentProfile.currentLoser].numPlayers / 2;

                for(i = 0; i < (roundProfile.numPlayers / 2); i++){
                    matchProfile = new Match({
                        _id: mongoose.Types.ObjectId(),
                        matchId: i + 1 + tournamentProfile.currentMatch,
                        playerLeft: roundProfile.name == 'LB1' ? tournamentProfile.winnerRounds[0].matches[i * 2].loser : i,
                        playerRight: roundProfile.name == 'LB1' ? tournamentProfile.winnerRounds[0].matches[i * 2 + 1].loser : i,
                        votesLeft: 0,
                        votesRight: 0,
                        open: true,
                   })
                   await matchProfile.save().catch(console.error);
                   client.count++
                   roundProfile.matches[i] = matchProfile;
                }
                await roundProfile.save().catch(console.error);
                tournamentProfile.currentBracket = 1;
                tournamentProfile.currentLoser++;
                await tournamentProfile.save().catch(console.error);
            }
            
            //if previous round was a minor loser bracket, next one has to be a winner
            else if (roundProfile.minor){
                console.log(2)
                roundProfile = new Round({
                    _id: mongoose.Types.ObjectId(),
                    name: `RO${tournamentProfile.playerCount / 2}`,
                    numPlayers: tournamentProfile.playerCount / 2,
                    winnerBraket: true,
                })
                await roundProfile.save().catch(console.error);
                tournamentProfile.currentBracket = 0;
                tournamentProfile.currentWinner++;
                await tournamentProfile.save().catch(console.error);
            }

            //if previous round was a major loser bracket, next one is a minor LB
            else{
                console.log(3)
                roundProfile = new Round({
                    _id: mongoose.Types.ObjectId(),
                    name: `LB${tournamentProfile.currentLoser + 1}`,
                    numPlayers: tournamentProfile.playerCount / 2,
                    winnerBraket: true,
                })
                await roundProfile.save().catch(console.error);
                tournamentProfile.currentBracket = 0;
                tournamentProfile.currentWinner++;
                await tournamentProfile.save().catch(console.error);
            }

            interaction.channel.send(`${roundProfile.name}: `);
        }
        
        //print next Matches
        i = tournamentProfile.currentMatch;
        count = roundProfile.matches.length + roundProfile.matches[0].matchId - 1;
        count = count > maxMatches + i + roundProfile.matches[0].matchId - 1 ? maxMatches + i + roundProfile.matches[0].matchId - 1 : count;
        console.log(`i: ${i}, count: ${count}`);
        for (; i < count; i++)
        {        
            matchProfile = await Match.findById(roundProfile.matches[i]);
            console.log(matchProfile.playerLeft);
            console.log(matchProfile.playerRight);
            if (matchProfile.playerRight){
                
                emote1 = roundProfile.matches[i].playerLeft.split(':')[2].slice(0, -1);
                emote2 = roundProfile.matches[i].playerRight.split(':')[2].slice(0, -1);

                console.log(emote1);
                const button1 = new ButtonBuilder()
                .setCustomId(matchProfile._id + ' left')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji(emote1);
                
                const button2 = new ButtonBuilder()
                .setCustomId(matchProfile._id + ' right')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji(emote2);
                interaction.channel.send({components: [
                    new ActionRowBuilder().addComponents(button1, button2)
                ]})
            }else{
                interaction.channel.send(`${i + 1} bye`)
            }
        }
    }
}