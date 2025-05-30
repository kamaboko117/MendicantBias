import type { CommandInteraction } from "discord.js";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  InteractionContextType,
  SlashCommandBuilder,
} from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("autorole")
    .setDescription("create autorole button")
    .setContexts([InteractionContextType.Guild]),

  async execute(interaction: CommandInteraction) {
    const button1 = new ButtonBuilder()
      .setCustomId("autorole")
      .setStyle(ButtonStyle.Secondary)
      .setEmoji("✅");

    await interaction.reply({
      components: [
        new ActionRowBuilder<ButtonBuilder>().addComponents(button1),
      ],
    });
  },

  usage: "",
};
