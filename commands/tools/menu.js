const { SlashCommandBuilder, SelectMenuBuilder, ActionRowBuilder, SelectMenuOptionBuilder } = require('discord.js');
const testMenu = require('../../components/selectMenus/testMenu');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('menu')
        .setDescription('idk dude'),
    async execute(interaction, client) {
        const menu = new SelectMenuBuilder()
            .setCustomId('testMenu')
            .setMinValues(1)
            .setMaxValues(1)
            .setOptions(new SelectMenuOptionBuilder({
                label: `lisablush`,
                value: 'one'
            }), new SelectMenuOptionBuilder({
                label: 'pepekama',
                value: 'two'
            })
            );
        await interaction.reply({
            components: [new ActionRowBuilder().addComponents(menu)]
        });
    },
};