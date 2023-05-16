import { getVoiceConnection } from "@discordjs/voice";
import { getQueueMessage } from "../../commands/music/queue.js";
import { mendicantShuffle } from "../../commands/music/shuffle.js";

export default {
  data: {
    name: "shuffle",
  },
  async execute(interaction, client) {
    console.log(`${interaction.member.displayName} used shuffle button`);
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
        content: "Nothing to shuffle",
      });
      return;
    }

    let queue = client.queues.find(
      (queue) => queue.id === interaction.guild.id
    );
    if (queue) queue = queue.queue;
    if (!queue || !queue.length) {
      await interaction.update({
        content: "Queue is empty",
        embeds: [],
        ephemeral: false,
      });
      return;
    }
    mendicantShuffle(queue);

    setTimeout(() => {
      let message = getQueueMessage(queue, index, client);
      interaction.update(message);
    }, 1_000);
  },
};
