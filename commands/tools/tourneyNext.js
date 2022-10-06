const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { Round } = require('../../schemas/round');
const { Match } = require ('../../schemas/match');
const Tournament = require('../../schemas/tournament');
const mongoose = require('mongoose');

maxMatches= 4

// export const generateId = (size = 32) => {
//     const bytesArray = new Uint8Array(size / 2)
  
//     window.crypto.getRandomValues(bytesArray) // search alternative to this 
//     return [...bytesArray]
//       .map((number) => number.toString(16).padStart(2, '0'))
//       .join('')
//   }

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tourney_next')
        .setDescription('post next matches for tournament'),
    async execute(interaction, client) {
        tournamentProfile = await Tournament.findOne();
        roundProfile = tournamentProfile.currentBracket ?
            tournamentProfile.loserRounds[tournamentProfile.currentLoser] :
            tournamentProfile.winnerRounds[tournamentProfile.currentWinner]

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
            currentBracket = tournamentProfile.currentBracket
            currentLoser = tournamentProfile.currentLoser
            currentWinner = tournamentProfile.currentWinner
            await tournamentProfile.save().catch(console.error); 
            for (; i < count; i++){
                matchProfile = roundProfile.matches[i];
                matchProfile.open = false;
                matchProfile.winner = matchProfile.votesRight > matchProfile.votesLeft ?
                    matchProfile.playerRight : matchProfile.playerLeft;
                matchProfile.loser = matchProfile.votesRight > matchProfile.votesLeft ?
                    matchProfile.playerLeft : matchProfile.playerRight;
                roundProfile.matches[i] = matchProfile;
                if (roundProfile.winnerBracket)
                    tournamentProfile.winnerRounds[tournamentProfile.currentWinner] = roundProfile;
                else
                    tournamentProfile.loserRounds[tournamentProfile.currentLoser] = roundProfile;
                await tournamentProfile.save().catch(console.error);
                if (matchProfile.playerRight){
                    
                    emote1 = roundProfile.matches[i].playerLeft.split(':')[2].slice(0, -1);
                    emote2 = roundProfile.matches[i].playerRight.split(':')[2].slice(0, -1);

                    const button1 = new ButtonBuilder()
                    .setCustomId(`T ${tourneyProfile._id} ${currentBracket} ${currentBracket ? currentLoser : currentWinner} ${i} left`)
                    .setStyle(ButtonStyle.Secondary)
                    .setLabel(`[${matchProfile.votesLeft}]`)
                    .setEmoji(emote1);
                    
                    const button2 = new ButtonBuilder()
                    .setCustomId(`T ${tourneyProfile._id} ${currentBracket} ${currentBracket ? currentLoser : currentWinner} ${i} right`)
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

        //if grandfinals
        if (roundProfile.name == 'GRAND FINALS'){

        }
        //if round is over and its not grandfinals
        else if (tournamentProfile.currentMatch == roundProfile.matches.length + roundProfile.matches[0].matchId - 1){
            
            //if previous round was winner bracket, next one has to be a loser
            if (roundProfile.winnerBracket){
                console.log(1)
                roundProfile = new Round({
                    _id: mongoose.Types.ObjectId(),
                    name: `LB${tournamentProfile.currentLoser + 1}`,        
                    winnerBracket: false,
                    // if this is the first loser bracket round, it should be minor
                    minor: tournamentProfile.currentLoser ? false : true,
                })
                roundProfile.numPlayers = roundProfile.minor ?
                    (tournamentProfile.currentLoser == 0 ?
                            tournamentProfile.winnerRounds[tournamentProfile.currentWinner].numPlayers / 2 :
                            tournamentProfile.loserRounds[tournamentProfile.currentLoser].numPlayers) :
                    tournamentProfile.loserRounds[tournamentProfile.currentLoser].numPlayers;

                for(i = 0; i < (roundProfile.numPlayers / 2); i++){
                    matchProfile = new Match({
                        _id: mongoose.Types.ObjectId(),
                        matchId: i + 1 + tournamentProfile.currentMatch,
                        playerLeft: roundProfile.name == 'LB1' ?
                            tournamentProfile.winnerRounds[tournamentProfile.currentWinner].matches[i * 2].loser :
                            tournamentProfile.winnerRounds[tournamentProfile.currentWinner].matches[i].loser,
                        playerRight: roundProfile.name == 'LB1' ?
                            tournamentProfile.winnerRounds[0].matches[i * 2 + 1].loser :
                            tournamentProfile.loserRounds[tournamentProfile.currentLoser].matches[i].winner,
                        votesLeft: 0,
                        votesRight: 0,
                        open: true,
                   })
                   client.count++
                   roundProfile.matches[i] = matchProfile;
                }
                tournamentProfile.currentBracket = 1;
                tournamentProfile.currentLoser++;
                tournamentProfile.loserRounds[tournamentProfile.currentLoser] = roundProfile;
                await tournamentProfile.save().catch(console.error);
            }
            
            //if previous round was a minor loser bracket, next one has to be a winner
            else if (roundProfile.minor){
                console.log(2)
                var RO = tournamentProfile.winnerRounds[tournamentProfile.currentWinner].matches.length;
                roundProfile = new Round({
                    _id: mongoose.Types.ObjectId(),
                    name: `RO${RO}`,
                    numPlayers: RO,
                    winnerBracket: true,
                })

                for(i = 0; i < (roundProfile.numPlayers / 2); i++){
                    matchProfile = new Match({
                        _id: mongoose.Types.ObjectId(),
                        matchId: i + 1 + tournamentProfile.currentMatch,
                        playerLeft: tournamentProfile.winnerRounds[tournamentProfile.currentWinner].matches[i * 2].winner,
                        playerRight: tournamentProfile.winnerRounds[tournamentProfile.currentWinner].matches[i * 2 + 1].winner,
                        votesLeft: 0,
                        votesRight: 0,
                        open: true,
                   })
                   client.count++
                   roundProfile.matches[i] = matchProfile;
                }
                tournamentProfile.currentBracket = 0;
                tournamentProfile.currentWinner++;
                tournamentProfile.winnerRounds[tournamentProfile.currentWinner] = roundProfile;
                await tournamentProfile.save().catch(console.error);
            }

            //if previous round was a major loser bracket, next one is a minor LB except if
            // its the LB finals
            else if (roundProfile.numPlayers != 2){
                console.log(3)
                roundProfile = new Round({
                    _id: mongoose.Types.ObjectId(),
                    name: `LB${tournamentProfile.currentLoser + 1}`,
                    numPlayers: tournamentProfile.loserRounds[tournamentProfile.currentLoser].numPlayers / 2,
                    winnerBracket: false,
                    minor: true,
                })
                for(i = 0; i < (roundProfile.numPlayers / 2); i++){
                    matchProfile = new Match({
                        _id: mongoose.Types.ObjectId(),
                        matchId: i + 1 + tournamentProfile.currentMatch,
                        playerLeft: tournamentProfile.winnerRounds[tournamentProfile.currentWinner].matches[i * 2].loser,
                        playerRight: tournamentProfile.loserRounds[tournamentProfile.currentLoser].matches[i * 2 + 1].winner,
                        votesLeft: 0,
                        votesRight: 0,
                        open: true,
                   })
                   client.count++
                   roundProfile.matches[i] = matchProfile;
                }
                tournamentProfile.currentBracket = 1;
                tournamentProfile.currentLoser++;
                tournamentProfile.loserRounds[tournamentProfile.currentLoser] = roundProfile;
                await tournamentProfile.save().catch(console.error);
            }

            //grandFinals
            else{
                roundProfile = new Round({
                    _id: mongoose.Types.ObjectId(),
                    name: `GRAND FINALS`,
                    numPlayers: 2,
                    winnerBracket: true,
                })
                
                matchProfile = new Match({
                    _id: mongoose.Types.ObjectId(),
                    matchId: 1 + tournamentProfile.currentMatch,
                    playerLeft: tournamentProfile.winnerRounds[tournamentProfile.currentWinner].matches[0].winner,
                    playerRight: tournamentProfile.loserRounds[tournamentProfile.currentLoser].matches[0].winner,
                    votesLeft: 0,
                    votesRight: 0,
                    open: true,
                })
                client.count++
                roundProfile.matches[0] = matchProfile;
                tournamentProfile.currentBracket = 0;
                tournamentProfile.currentWinner++;
                tournamentProfile.winnerRounds[tournamentProfile.currentWinner] = roundProfile;
                await tournamentProfile.save().catch(console.error);
            }

            interaction.channel.send(`${roundProfile.name}: `);
        }
        
        //print next Matches
        i = tournamentProfile.currentMatch - roundProfile.matches[0].matchId + 1;
        count = roundProfile.matches.length;
        count = count > maxMatches + i ? maxMatches + i : count;
        console.log(`i: ${i}, count: ${count}`);
        for (; i < count; i++)
        {        
            matchProfile = roundProfile.matches[i];
            console.log(matchProfile.playerLeft);
            console.log(matchProfile.playerRight);
            if (matchProfile.playerRight){
                
                emote1 = roundProfile.matches[i].playerLeft.split(':')[2].slice(0, -1);
                emote2 = roundProfile.matches[i].playerRight.split(':')[2].slice(0, -1);

                console.log(emote1);
                const button1 = new ButtonBuilder()
                .setCustomId(`T ${tourneyProfile._id} ${tournamentProfile.currentBracket} ${tournamentProfile.currentBracket ? tournamentProfile.currentLoser : tournamentProfile.currentWinner} ${i} left`)
                .setStyle(ButtonStyle.Secondary)
                .setEmoji(emote1);
                
                const button2 = new ButtonBuilder()
                
                .setCustomId(`T ${tourneyProfile._id} ${tournamentProfile.currentBracket} ${tournamentProfile.currentBracket ? tournamentProfile.currentLoser : tournamentProfile.currentWinner} ${i} right`)
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