import ytdl from "ytdl-core";
import { mendicantCreateItem, mendicantPlay, mendicantSearch } from "./play.js";
import { SlashCommandBuilder } from "@discordjs/builders";

export default {
  data: new SlashCommandBuilder()
    .setName("ptop")
    .setDescription("plays a video from youtube in voice chat")
    .addStringOption((option) =>
      option
        .setName("url-or-search")
        .setDescription("youtube video link or search")
        .setRequired(true)
    ),
  async execute(interaction, client) {
    const option1 = interaction.options.getString("url-or-search");
    console.log(`${interaction.member.displayName} used /play ${option1}`);

    if (ytdl.validateURL(option1)) {
      let ID = ytdl.getURLVideoID(option1);
      let item = await mendicantCreateItem(interaction, ID);
      if (!item) {
        interaction.reply("Error: Could not create item");
        return;
      }

      await mendicantPlay(interaction, item, client, false, 1);

      return;
    }
    await mendicantSearch(option1, interaction, client, 1);
  },

  usage:
    "play a video from youtube. you can either use the video's URL or search for an input. Unlike /play, /ptop will always queue the song at the top of the list",
};
