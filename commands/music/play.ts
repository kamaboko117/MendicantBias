import ytdl from "@distube/ytdl-core";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  InteractionContextType,
  SlashCommandBuilder,
} from "discord.js";
import dotenv from "dotenv";
import * as youtubei from "youtubei";
import type { GuildCommandInteraction } from "../../classes/GuildCommandInteraction";
import type { Mendicant } from "../../classes/Mendicant";
import { mendicantCreateItem } from "./helpers/mendicantCreateItem";
import { mendicantPlay } from "./helpers/mendicantPlay";
import { mendicantSearch } from "./helpers/mendicantSearch";
import { findVideoIndex, getPlaylistId, isPlaylist } from "./helpers/utils";
dotenv.config({ path: "./.env" });

export default {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("plays a video from youtube in voice chat")
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
    const playlistFlag = isPlaylist(option1);

    if (playlistFlag) {
      const playlistID = getPlaylistId(option1);
      console.log("playlist");
      console.log(`URL: ${option1} ID: ${playlistID}`);

      const youtube = new youtubei.Client();

      youtube.getPlaylist(playlistID).then(async (playlist) => {
        if (!playlist) {
          if (interaction.channel?.isSendable())
            interaction.channel?.send(
              "Could not get playlist, make sure it is public"
            );
          return;
        }
        const index = findVideoIndex(option1);

        const button1 = new ButtonBuilder()
          .setCustomId(`A ${playlistID} ${index}`)
          .setStyle(ButtonStyle.Secondary)
          .setEmoji("✅");

        const button2 = new ButtonBuilder()
          .setCustomId(`S ${playlistID} ${index}`)
          .setStyle(ButtonStyle.Secondary)
          .setEmoji("🔀");

        if (interaction.channel?.isSendable()) {
          await interaction.channel?.send({
            content: `Add this playlist to the queue? (${
              playlist.videoCount - index
            } videos)`,
            components: [
              new ActionRowBuilder<ButtonBuilder>()
                .addComponents(button1)
                .addComponents(button2),
            ],
          });
        }
      });
    }
    if (ytdl.validateURL(option1)) {
      const ID = ytdl.getURLVideoID(option1);
      const item = await mendicantCreateItem(ID, null);

      if (!item) {
        interaction.reply("Error: Could not create item");
        return;
      }

      await mendicantPlay(interaction, item, mendicant, false, 0);

      return;
    }

    if (!playlistFlag) {
      await mendicantSearch(option1, interaction, mendicant, 0);
    } else {
      interaction.reply("Playlist detected");
    }
  },

  usage:
    "play a video from youtube. you can either use the video's URL or search for an input",
};
