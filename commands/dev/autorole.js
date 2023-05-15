import {
  SlashCommandBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
} from "discord.js";

export default {
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

  usage:
    "",
};
