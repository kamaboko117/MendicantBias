import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Mendicant } from "../../classes/Mendicant";

export default {
  data: new SlashCommandBuilder()
    .setName("list-guilds")
    .setDescription("get the list of all the guilds the bot is in"),

  async execute(interaction: ChatInputCommandInteraction, mendicant: Mendicant) {
    const guilds = mendicant.guilds.cache.map((guild) => guild.name);
    await interaction.reply({
      content: `**Number of Guilds:** ${guilds.length}\n**Guilds:**\n${guilds.join("\n")}`,
      ephemeral: false,
    });
  },

  usage: "",
};
