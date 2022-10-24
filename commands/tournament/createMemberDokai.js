const {
    SlashCommandBuilder,
    ModalBuilder,
    ActionRowBuilder,
    TextInputBuilder,
    TextInputStyle
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('create-memberdokai')
        .setDescription('create a memberdokai tournament through a form'),
    async execute(interaction, client) {
        const modal = new ModalBuilder()
            .setCustomId('memberdokai-form')
            .setTitle('New Memberdokai');

        const name = new TextInputBuilder()
            .setCustomId('tournamentName')
            .setLabel('Tournament Name:')
            .setMaxLength(24)
            .setPlaceholder('Memberdokai')
            .setRequired(true)
            .setStyle(TextInputStyle.Short);

        // const guilds = new TextInputBuilder()
        // .setCustomId('guilds')
        // .setLabel(`emotes' source servers:`)
        // .setMaxLength(100)
        // .setPlaceholder('IDs separated by whitespaces. 3 max')
        // .setValue(interaction.guildId)
        // .setRequired(true)
        // .setStyle(TextInputStyle.Short);

        const firstActionRow = new ActionRowBuilder().addComponents(name);
		// const secondActionRow = new ActionRowBuilder().addComponents(guilds);
        modal.addComponents(firstActionRow)//, secondActionRow);

        await interaction.showModal(modal);
    },

    usage: "Once your tourney is created, you can use \
    \`/mdokai-next\` to advance the tournament."
}