const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const Round = require('../../schemas/round');
const Match = require ('../../schemas/match');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tourney_next')
        .setDescription('post next matches for tournament'),
    async execute(interaction, client) {
        roundProfile = await Round.findOne({name: 'Ro512'})
        for (i = 0; i < 16; i++)
        {
            matchProfile = Match.findOne({_id: roundProfile.matches[i]});
            const button1 = new ButtonBuilder()
            .setCustomId(matchProfile._id + ' left')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji(matchProfile.playerLeft);
            
            const button2 = new ButtonBuilder()
            .setCustomId(matchProfile._id + ' right')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji(emote2.playerRight);
            await interaction.reply({
                content: "pouet"
            });

            await interaction.reply({
                components: [
                    new ActionRowBuilder().addComponents(button1, button2)
                ]
            });
        }
    }
}