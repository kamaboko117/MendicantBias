import { SlashCommandBuilder } from "@discordjs/builders";
import type GuildCommandInteraction from "../../classes/GuildCommandInteraction";

export default {
  data: new SlashCommandBuilder()
    .setName("invite")
    .setDescription("get my invite link"),
  async execute(interaction: GuildCommandInteraction) {
    await interaction.reply(
      "Click on my profile and you should see a button to invite me"
    );
  },
};
