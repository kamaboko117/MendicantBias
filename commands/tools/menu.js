const { SlashCommandBuilder, SelectMenuBuilder, ActionRowBuilder, SelectMenuOptionBuilder } = require('discord.js');
const testMenu = require('../../components/selectMenus/testMenu');
const Match = require ('../../schemas/match');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('menu')
        .setDescription('idk dude'),
    async execute(interaction, client) {
        options = [];
        const count = await Match.estimatedDocumentCount();
        for (i = 0; i < count; i++){
            matchProfile = await Match.findOne({matchId: i + 1});
            options[i] = {
                label: "match ID: " + matchProfile.matchId,
                // value: matchProfile.playerLeft + " vs " + matchProfile.playerRight + " " + i
                value: `` + matchProfile.matchId
            };
        }
        const menu = new SelectMenuBuilder()
            .setCustomId('testMenu')
            .setMinValues(1)
            .setMaxValues(1)
            .addOptions(options);
        await interaction.reply({
            components: [new ActionRowBuilder().addComponents(menu)]
        });
    },
};