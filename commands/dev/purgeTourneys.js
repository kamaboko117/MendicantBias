import { SlashCommandBuilder } from "@discordjs/builders";
import Tournament from "../../schemas/tournament.js";

export default {
  data: new SlashCommandBuilder()
    .setName("purge-tourney")
    .setDescription("Delete all tourneys from database"),
  async execute(interaction, client) {
    if (interaction.member.id != "180611811412803584") {
      await interaction.reply("forbiden");
      return;
    }
    await Tournament.deleteMany({});
    await interaction.reply("done");
  },
};
