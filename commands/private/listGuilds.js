import { SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("list-guilds")
    .setDescription("get the list of all the guilds the bot is in"),

  async execute(interaction, client) {
    const guilds = client.guilds.cache.map((guild) => guild.name);
    await interaction.reply({
      content: `Guilds:\n${guilds.join("\n")}`,
      ephemeral: false,
    });
  },

  usage: "",
};
