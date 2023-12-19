import { SlashCommandBuilder } from "@discordjs/builders";
import GuildCommandInteraction from "../../classes/GuildCommandInteraction";
import { Mendicant } from "../../classes/Mendicant";

export default {
  data: new SlashCommandBuilder()
    .setName("invite")
    .setDescription("get my invite link"),
  async execute(interaction: GuildCommandInteraction, mendicant: Mendicant) {
    await interaction.reply(
      "Click on my profile and you should see a button to invite me"
    );
  },
};
