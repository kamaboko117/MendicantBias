import { getVoiceConnection } from "@discordjs/voice";
import GuildButtonInteraction from "../../classes/GuildButtonInteraction";
import { Mendicant } from "../../classes/Mendicant";

export default {
  data: {
    name: "stop",
  },
  async execute(interaction: GuildButtonInteraction, mendicant: Mendicant) {
    console.log(`${interaction.member.displayName} used stop button`);
    const idsplit = interaction.customId.split(" ");
    const index = Number(idsplit[1]);

    const { voice } = interaction.member;
    if (!voice.channelId) {
      interaction.reply("Error: You are not in a voice channel");
      return;
    }
    const connection = getVoiceConnection(interaction.guild.id);
    if (!connection) {
      await interaction.reply({
        content: "Nothing to stop",
      });
      return;
    }

    let queue = mendicant.queues.find(
      (queue) => queue.id === interaction.guild.id
    );
    if (queue) queue = queue.queue;
    if (!queue || !queue.length || connection.state.status === "destroyed") {
      await interaction.update({
        content: "Queue is empty",
        embeds: [],
      });
      return;
    }
    let subscription = connection.state.subscription;
    let player = subscription?.player;

    queue.length = 0;
    player?.stop();

    let message = { content: "Queue cleared", embeds: [] };
    interaction.update(message);
  },
};
