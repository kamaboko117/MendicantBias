const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const Round = require('../../schemas/round');
const { Match } = require ('../../schemas/match');
const Tournament = require('../../schemas/tournament');

maxMatches= 8

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tourney_next')
        .setDescription('post next matches for tournament'),
    async execute(interaction, client) {
        tournamentProfile = await Tournament.findOne();
        roundProfile = await Round.findOne({name: tournamentProfile.currentRound})
        if (!tournamentProfile.open){
            tournamentProfile.open = true;
            tournamentProfile.save().catch(console.error);
            await interaction.reply({
                content: "next matches:"
            });
        }else{

            //show previous day's results and close matches
            await interaction.reply({
                content: "last day's results:"
            });

            i = tournamentProfile.currentMatch;
            count = roundProfile.matches.length;
            count = count - i > maxMatches ? maxMatches : count;
            tournamentProfile.currentMatch += count;
            await tournamentProfile.save().catch(console.error); 
            for (; i < count; i++){
                matchProfile = await Match.findById(roundProfile.matches[i]);
                matchProfile.open = false;
                matchProfile.winner = matchProfile.votesRight > matchProfile.votesLeft ?
                    matchProfile.playerRight : matchProfile.playerLeft;
                await matchProfile.save().catch(console.error); 
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
            
            interaction.channel.send(`next matches:`)
        }
        
        //print next Matches
        i = tournamentProfile.currentMatch;
        count = roundProfile.matches.length;
        count = count - i > maxMatches ? maxMatches : count;
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