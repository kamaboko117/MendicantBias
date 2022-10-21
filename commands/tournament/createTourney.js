const {
    SlashCommandBuilder,
    ModalBuilder,
    ActionRowBuilder,
    TextInputBuilder,
    TextInputStyle
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('create-tourney')
        .setDescription('create an emotedokai tournament through a form'),
    async execute(interaction, client) {
        const modal = new ModalBuilder()
            .setCustomId('tournament-form')
            .setTitle('New Tournament');

        const name = new TextInputBuilder()
            .setCustomId('tournamentName')
            .setLabel('Tournament Name:')
            .setMaxLength(24)
            .setPlaceholder('Emotedokai')
            .setRequired(true)
            .setStyle(TextInputStyle.Short);

        const guilds = new TextInputBuilder()
        .setCustomId('guilds')
        .setLabel(`emotes' source servers:`)
        .setMaxLength(100)
        .setPlaceholder('IDs separated by whitespaces. 3 max')
        .setValue(interaction.guildId)
        .setRequired(true)
        .setStyle(TextInputStyle.Short);

        const firstActionRow = new ActionRowBuilder().addComponents(name);
		const secondActionRow = new ActionRowBuilder().addComponents(guilds);
        modal.addComponents(firstActionRow, secondActionRow);

        await interaction.showModal(modal);
    }
}