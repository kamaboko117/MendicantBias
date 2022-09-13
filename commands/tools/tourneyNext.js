const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const Round = require('../../schemas/round');
const { Match } = require ('../../schemas/match');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tourney_next')
        .setDescription('post next matches for tournament'),
    async execute(interaction, client) {
        roundProfile = await Round.findOne({name: 'Ro512'})
        await interaction.reply({
            content: "next matches:"
        });
        for (i = 0; i < 16; i++)
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