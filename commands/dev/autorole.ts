import {
  SlashCommandBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
  CommandInteraction,
} from "discord.js";
import { Mendicant } from "../../classes/Mendicant";

export default {
  data: new SlashCommandBuilder()
    .setName("autorole")
    .setDescription("create autorole button"),

  async execute(interaction: CommandInteraction, mendicant: Mendicant) {
    const button1 = new ButtonBuilder()
      .setCustomId("autorole")
      .setStyle(ButtonStyle.Secondary)
      .setEmoji("✅");

    await interaction.reply({
      components: [new ActionRowBuilder<ButtonBuilder>().addComponents(button1)],
    });
  },

  usage:
    "",
};
