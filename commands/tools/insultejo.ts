import { SlashCommandBuilder } from "@discordjs/builders";
import GuildCommandInteraction from "../../classes/GuildCommandInteraction";
import { Mendicant } from "../../classes/Mendicant";

export default {
  data: new SlashCommandBuilder()
    .setName("insult-jo")
    .setDescription("Insults the doggo named Johnnyeco"),

  async execute(interaction: GuildCommandInteraction, mendicant: Mendicant) {
    await interaction.reply({
      content: "<@170617264662511616> you absolute faggot",
    });
  },

  usage:
    "Use carefully: Yellow Members might endure the consequences of this action",
};
