import { getVoiceConnection } from "@discordjs/voice";
import type GuildButtonInteraction from "../../classes/GuildButtonInteraction";

export default {
  data: {
    name: "pause",
  },
  async execute(interaction: GuildButtonInteraction) {
    let msg = "";
    const voice = interaction.member?.voice;
    if (!voice) {
      await interaction.reply({
        content: "Error: You are not in a voice channel",
        ephemeral: true,
      });
      return;
    }
    const connection = getVoiceConnection(interaction.guild.id);
    if (!connection || connection.state.status === "destroyed") {
      await interaction.reply({
        content: "Nothing to pause",
        ephemeral: true,
      });
      return;
    }
    const subscription = connection.state.subscription;
    const player = subscription?.player;
    if (player?.state.status === "paused") {
      player.unpause();
      msg = "Unpaused";
    } else {
      player?.pause();
      msg = "Paused";
    }

    await interaction.reply({
      content: msg,
    });
  },
};
