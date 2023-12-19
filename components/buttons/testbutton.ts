import GuildButtonInteraction from "../../classes/GuildButtonInteraction";
import { Mendicant } from "../../classes/Mendicant";

export default {
  data: {
    name: "test",
  },
  async execute(interaction: GuildButtonInteraction, mendicant: Mendicant) {
    await interaction.reply({
      content: "https://www.twitch.tv/kamaboko117",
    });
  },
};
