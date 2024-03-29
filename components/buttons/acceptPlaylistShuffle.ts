import { Mendicant } from "../../classes/Mendicant.js";
import { youtubeiGetPlaylist } from "../../components/buttons/acceptPlaylist";
import { mendicantPlayPlaylist } from "../../components/buttons/acceptPlaylist";
import GuildButtonInteraction from "../../classes/GuildButtonInteraction.js";

export default {
  data: {
    name: "acceptplaylistshuffle",
  },
  async execute(interaction: GuildButtonInteraction, mendicant: Mendicant) {
    await interaction.deferReply();
    let idsplit = interaction.customId.split(" ");
    // gets the index of the video to skip when retrieving the playlist
    let index = parseInt(idsplit[2]);

    const playlist = await youtubeiGetPlaylist(idsplit);
    // shuffle playlist and replace old index with new index
    let currentIndex = playlist.videos.items.length;
    let temporaryValue;
    let randomIndex;
    let newIndex = 0;
    while (0 !== currentIndex) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
      temporaryValue = playlist.videos.items[currentIndex];
      playlist.videos.items[currentIndex] = playlist.videos.items[randomIndex];
      playlist.videos.items[randomIndex] = temporaryValue;
      if (currentIndex === index) {
        newIndex = randomIndex;
      }
    }
    mendicantPlayPlaylist(playlist, index, interaction, mendicant);
    await interaction.editReply({
      content: "Done",
    });
  },
};
