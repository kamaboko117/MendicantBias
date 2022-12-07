const {
    SlashCommandBuilder,
    ButtonBuilder,
    ActionRowBuilder,
    ButtonStyle,
} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("autorole")
        .setDescription("create autorole button"),

    async execute(interaction, client) {
        const button1 = new ButtonBuilder()
            .setCustomId("autorole")
            .setStyle(ButtonStyle.Secondary)
            .setEmoji("✅");

        await interaction.reply({
            components: [new ActionRowBuilder().addComponents(button1)],
        });
    },

    usage: "Use carefully: Yellow Members might endure the consequences of this action",
};
