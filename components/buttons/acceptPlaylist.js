import { mendicantPlay } from "../../commands/music/play.js";
import youtubesearchapi from "youtube-search-api";
import youtubei from "youtubei";

function toSeconds(str) {
  return str.split(":").reduce(function (seconds, v) {
    return +v + seconds * 60;
  }, 0);
}

export default {
  data: {
    name: "acceptplaylist",
  },
  async execute(interaction, client) {
    let idsplit = interaction.component.customId.split(" ");
    let index = idsplit[2];
    // with youtubesearchapi
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

    // with youtubei
    const youtube = new youtubei.Client();
    const playlist = await youtube.getPlaylist(idsplit[1]);
    let newVideos = await playlist.videos.next();
    while (newVideos.length) {
      newVideos = await playlist.videos.next();
    }
    console.log(playlist.videos.items.length);
    let i = 0;
    for (const video of playlist.videos.items) {
      if (i < index) i++;
      else {
        let videoDetails = new Object();
        videoDetails.id = video.id;
        videoDetails.title = video.title;
        videoDetails.length = video.duration;
        mendicantPlay(interaction, videoDetails, client, true);
      }
    }

    await interaction.reply({
      content: "Done",
      ephemeral: true,
    });
  },
};
