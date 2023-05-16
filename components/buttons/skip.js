import { getVoiceConnection } from "@discordjs/voice";
import { getQueueMessage } from "../../commands/music/queue.js";

export default {
  data: {
    name: "skip",
  },
  async execute(interaction, client) {
    console.log(`${interaction.member.displayName} used skip button`);
    const idsplit = interaction.component.customId.split(" ");
    const index = Number(idsplit[1]);

    const { voice } = interaction.member;
    if (!voice.channelId) {
      interaction.reply("Error: You are not in a voice channel");
      return;
    }
    const connection = getVoiceConnection(interaction.guild.id);
    if (!connection) {
      await interaction.reply({
        content: "Nothing to skip(1)",
      });
      return;
    }

    let subscription = connection.state.subscription;
    let player = subscription.player;

    if (!player) {
      await interaction.reply({
        content: "Nothing to skip(2)",
      });
      return;
    }

    //player's event listener on idle will play next resource automatically
    player.stop();

    let queue = client.queues.find(
      (queue) => queue.id === interaction.guild.id
    );
    if (queue) queue = queue.queue;
    if (!queue || queue.isEmpty) {
      await interaction.update({
        content: "Queue is empty",
        embeds: [],
        ephemeral: false,
      });
      return;
    }

    setTimeout(() => {
      let message = getQueueMessage(queue, index, client);
      interaction.update(message);
    }, 1_000);
  },
};
