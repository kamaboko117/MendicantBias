import * as youtubei from "youtubei";
import type { GuildButtonInteraction } from "../../classes/GuildButtonInteraction";
import type { Mendicant } from "../../classes/Mendicant";
import VideoDetails from "../../classes/VideoDetails";
import { mendicantPlay } from "../../commands/music/helpers/mendicantPlay";

export const youtubeiGetPlaylist = async (idsplit: string[]) => {
  const youtube = new youtubei.Client();
  const playlist = (await youtube.getPlaylist(idsplit[1])) as youtubei.Playlist;

  // in case the playlist is a youtube mix, .next() doesnt exist
  if (playlist.videos.next) {
    let newVideos = await playlist.videos.next();
    while (newVideos.length) {
      newVideos = await playlist.videos.next();
    }
    return playlist;
  } else {
    const mix = playlist as unknown as youtubei.MixPlaylist;
    const newPlaylist = {
      videos: {
        items: mix.videos,
      },
    };
    return newPlaylist as youtubei.Playlist;
  }
};

export const mendicantPlayPlaylist = async (
  playlist: youtubei.Playlist,
  index: number,
  interaction: GuildButtonInteraction,
  mendicant: Mendicant
) => {
  let i = 0;
  for (const video of playlist.videos.items) {
    if (i < index) i++;
    else {
      const videoDetails = new VideoDetails(
        video.id,
        video.title,
        video.duration || 0
      );
      mendicantPlay(interaction, videoDetails, mendicant, true, 0);
    }
  }
};

export default {
  data: {
    name: "acceptplaylist",
  },
  async execute(interaction: GuildButtonInteraction, mendicant: Mendicant) {
    await interaction.deferReply();
    const idsplit = interaction.customId.split(" ");
    const index = parseInt(idsplit[2]);

    const playlist = await youtubeiGetPlaylist(idsplit);
    mendicantPlayPlaylist(playlist, index, interaction, mendicant);

    await interaction.editReply({
      content: "Done",
    });
  },
};
