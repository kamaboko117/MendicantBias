import type GuildButtonInteraction from "../../classes/GuildButtonInteraction";

export default {
  data: {
    name: "test",
  },
  async execute(interaction: GuildButtonInteraction) {
    await interaction.reply({
      content: "https://www.twitch.tv/kamaboko117",
    });
  },
};
