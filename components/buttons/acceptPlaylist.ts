import { Mendicant } from "../../classes/Mendicant.js";
import { mendicantPlay } from "../../commands/music/play";
// import youtubesearchapi from "youtube-search-api";
import * as youtubei from "youtubei";
import GuildButtonInteraction from "../../classes/GuildButtonInteraction.js";
import VideoDetails from "../../classes/VideoDetails";

function toSeconds(str: string) {
  return str.split(":").reduce(function (seconds, v) {
    return +v + seconds * 60;
  }, 0);
}

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
    }
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
      let videoDetails = new VideoDetails(
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
    let idsplit = interaction.customId.split(" ");
    let index = parseInt(idsplit[2]);
    // with youtubesearchapi
    // DOESN'T HANDLE MORE THAN 100 VIDEOS
    // youtubesearchapi.GetPlaylistData(idsplit[1], 1000).then(async (playlist) => {
    //   let i = 0;
    //   for (const video of playlist.items) {
    //     if (i < index) i++;
    //     else {
    //       let videoDetails = new Object();
    //       videoDetails.id = video.id;
    //       videoDetails.title = video.title;
    //       videoDetails.length = toSeconds(video.length.simpleText);
    //       mendicantPlay(interaction, videoDetails, client, true);
    //     }
    //   }
    // });

    const playlist = await youtubeiGetPlaylist(idsplit);
    mendicantPlayPlaylist(playlist, index, interaction, mendicant);

    await interaction.editReply({
      content: "Done",
    });
  },
};
