import ytdl from "ytdl-core";
import { mendicantCreateItem, mendicantPlay, mendicantSearch } from "./play";
import { SlashCommandBuilder } from "@discordjs/builders";
import GuildCommandInteraction from "../../classes/GuildCommandInteraction.js";
import { Mendicant } from "../../classes/Mendicant.js";

export default {
  data: new SlashCommandBuilder()
    .setName("ptop")
    .setDescription("plays a video from youtube in voice chat at the top of the queue")
    .addStringOption((option) =>
      option
        .setName("url-or-search")
        .setDescription("youtube video link or search")
        .setRequired(true)
    ),
  async execute(interaction: GuildCommandInteraction, mendicant: Mendicant) {
    const option1 = interaction.options.getString("url-or-search")!;
    console.log(`${interaction.member.displayName} used /play ${option1}`);

    if (ytdl.validateURL(option1)) {
      let ID = ytdl.getURLVideoID(option1);
      let item = await mendicantCreateItem(ID, null);
      if (!item) {
        interaction.reply("Error: Could not create item");
        return;
      }

      await mendicantPlay(interaction, item, mendicant, false, 1);

      return;
    }
    await mendicantSearch(option1, interaction, mendicant, 1);
  },

  usage:
    "play a video from youtube and place it at the top of the queue. you can either use the video's URL or search for an input. Unlike /play, /ptop will always queue the song at the top of the list",
};
