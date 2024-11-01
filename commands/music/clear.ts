import { SlashCommandBuilder } from "@discordjs/builders";
import { getVoiceConnection } from "@discordjs/voice";
import { InteractionContextType } from "discord.js";
import GuildCommandInteraction from "../../classes/GuildCommandInteraction";
import { Mendicant } from "../../classes/Mendicant";

export default {
  data: new SlashCommandBuilder()
    .setName("clear")
    .setDescription("Empty the current queue")
    .setContexts([InteractionContextType.Guild]),

  async execute(interaction: GuildCommandInteraction, mendicant: Mendicant) {
    console.log(`${interaction.member.displayName} used /clear`);
    const { voice } = interaction.member;
    if (!voice.channelId) {
      return interaction.reply("Error: You are not in a voice channel");
    }
    const connection = getVoiceConnection(interaction.guild.id);
    if (!connection || connection.state.status === "destroyed") {
      return interaction.reply("Nothing to clear");
    }
    const queue = mendicant.queues.find((queue) => queue.id === interaction.guild.id);
    if (queue) {
      queue.queue.length = 0;
    }
    connection.state.subscription?.player?.stop();

    return interaction.reply("Cleared");
  },

  usage: "",
};
