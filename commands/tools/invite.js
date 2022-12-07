const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("invite")
        .setDescription("get my invite link"),
    async execute(interaction, client) {
        await interaction.reply({
            content: client.invite2,
        });
    },
};
