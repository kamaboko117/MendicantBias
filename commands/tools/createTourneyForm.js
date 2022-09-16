const {
    SlashCommandBuilder,
    ModalBuilder,
    ActionRowBuilder,
    TextInputBuilder,
    TextInputStyle
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('create-tourney-form')
        .setDescription('create an emotedokai tournament through a form'),
    async execute(interaction, client) {
        const modal = new ModalBuilder()
            .setCustomId('tournament-form')
            .setTitle('New Tournament');

        const textInput = new TextInputBuilder()
            .setCustomId('tournamentName')
            .setLabel('Tournament Name:')
            .setRequired(true)
            .setStyle(TextInputStyle.Short);

        modal.addComponents(new ActionRowBuilder().addComponents(textInput));

        await interaction.showModal(modal);
    }
}