import { SlashCommandBuilder } from "@discordjs/builders";
import type { CommandInteraction } from "discord.js";
import Tournament from "../../schemas/tournament";

export default {
  data: new SlashCommandBuilder()
    .setName("purge-tourney")
    .setDescription("Delete all tourneys from database"),
  async execute(interaction: CommandInteraction) {
    if (interaction.member?.user.id !== "180611811412803584") {
      await interaction.reply("forbidden");
      return;
    }
    await Tournament.deleteMany({});
    await interaction.reply("done");
  },
};
