const { SlashCommandBuilder, SelectMenuBuilder, ActionRowBuilder, SelectMenuOptionBuilder } = require('discord.js');
const testMenu = require('../../components/selectMenus/revealMenu');
const Match = require ('../../schemas/match');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reveal')
        .setDescription('reveals a match result and closes the match'),
    async execute(interaction, client) {
        options = [];
        const count = client.matchCount;
        if (!count){
            await interaction.reply({
                content: "no matches"
            });
            return ;
        }
        for (i = 0; i < count - 1; i++){
            matchProfile = await Match.findOne({matchId: i + 1});
            options[i] = {
                label: "match ID: " + matchProfile.matchId,
                // value: matchProfile.playerLeft + " vs " + matchProfile.playerRight + " " + i
                value: `` + matchProfile.matchId
            };
        }
        const menu = new SelectMenuBuilder()
            .setCustomId('revealMenu')
            .setMinValues(1)
            .setMaxValues(1)
            .addOptions(options);
        await interaction.reply({
            components: [new ActionRowBuilder().addComponents(menu)]
        });
    },
};