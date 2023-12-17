import { SlashCommandBuilder } from "@discordjs/builders";
import Tournament from "../../schemas/tournament";
import { CommandInteraction } from "discord.js";
import { Mendicant } from "../../classes/Mendicant";

export default {
  data: new SlashCommandBuilder()
    .setName("purge-tourney")
    .setDescription("Delete all tourneys from database"),
  async execute(interaction: CommandInteraction, mendicant: Mendicant) {
    if (interaction.member?.user.id !== "180611811412803584") {
      await interaction.reply("forbidden");
      return;
    }
    await Tournament.deleteMany({});
    await interaction.reply("done");
  },
};
