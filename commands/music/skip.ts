import { SlashCommandBuilder } from "@discordjs/builders";
import { getVoiceConnection } from "@discordjs/voice";
import GuildCommandInteraction from "../../classes/GuildCommandInteraction";
import { Mendicant } from "../../classes/Mendicant";

export default {
  data: new SlashCommandBuilder()
    .setName("skip")
    .setDescription("Skip the current song"),

  async execute(interaction: GuildCommandInteraction, mendicant: Mendicant) {
    console.log(`${interaction.member.displayName} used /skip`);
    const { voice } = interaction.member;
    if (!voice.channelId) {
      return interaction.reply("Error: You are not in a voice channel");
    }
    const connection = getVoiceConnection(interaction.guild.id);
    if (!connection || connection.state.status === "destroyed") {
      return interaction.reply("Nothing to skip");
    }
    const subscription = connection.state.subscription;
    const player = subscription?.player;

    // Player's event listener on idle will play the next resource automatically
    player?.stop();

    return interaction.reply("Skipped");
  },

  usage: "",
};
