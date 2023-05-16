export default {
  data: {
    name: "test",
  },
  async execute(interaction, client) {
    await interaction.reply({
      content: "https://www.twitch.tv/kamaboko117",
    });
  },
};
