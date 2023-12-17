import { SlashCommandBuilder } from "@discordjs/builders";
import { getVoiceConnection } from "@discordjs/voice";
import GuildCommandInteraction from "../../classes/GuildCommandInteraction";
import { Mendicant } from "../../classes/Mendicant";

export default {
  data: new SlashCommandBuilder()
    .setName("skip")
    .setDescription("skip current song"),

  async execute(interaction: GuildCommandInteraction, mendicant: Mendicant) {
    console.log(`${interaction.member.displayName} used /skip`);
    const { voice } = interaction.member;
    if (!voice.channelId) {
      interaction.reply("Error: You are not in a voice channel");
      return;
    }
    const connection = getVoiceConnection(interaction.guild.id);
    if (!connection) {
      await interaction.reply({
        content: "Nothing to skip",
      });
      return;
    }
    if (connection.state.status === "destroyed") {
      await interaction.reply({
        content: "Nothing to skip",
      });
      return;
    }
    let subscription = connection.state.subscription;
    let player = subscription?.player;

    //player's event listener on idle will play next resource automatically
    player?.stop();

    await interaction.reply({
      content: "Skipped",
    });
  },

  usage: "",
};
