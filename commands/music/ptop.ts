import { SlashCommandBuilder } from "@discordjs/builders";
import ytdl from "@distube/ytdl-core";
import { InteractionContextType } from "discord.js";
import type { GuildCommandInteraction } from "../../classes/GuildCommandInteraction";
import type { Mendicant } from "../../classes/Mendicant";
import { mendicantCreateItem } from "./helpers/mendicantCreateItem";
import { mendicantPlay } from "./helpers/mendicantPlay";
import { mendicantSearch } from "./helpers/mendicantSearch";

export default {
  data: new SlashCommandBuilder()
    .setName("ptop")
    .setDescription(
      "plays a video from youtube in voice chat at the top of the queue"
    )
    .addStringOption((option) =>
      option
        .setName("url-or-search")
        .setDescription("youtube video link or search")
        .setRequired(true)
    )
    .setContexts([InteractionContextType.Guild]),

  async execute(interaction: GuildCommandInteraction, mendicant: Mendicant) {
    const option1 = interaction.options.getString("url-or-search")!;
    console.log(`${interaction.user.username} used /play ${option1}`);

    if (ytdl.validateURL(option1)) {
      const ID = ytdl.getURLVideoID(option1);
      const item = await mendicantCreateItem(ID, null);
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
