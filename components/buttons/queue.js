import { getQueueMessage } from "../../commands/music/queue.js";

export default {
  data: {
    name: "queue",
  },
  async execute(interaction, client) {
    let idsplit = interaction.component.customId.split(" ");
    let index = Number(idsplit[1]);
    let queue = client.queues.find(
      (queue) => queue.id === interaction.guild.id
    );
    if (queue) {
      queue = queue.queue;
    }
    if (!queue || queue.isEmpty) {
      await interaction.update({
        content: "Queue is empty",
        embeds: [],
        ephemeral: false,
      });
      return;
    }
    let message = getQueueMessage(queue, index, client);

    await interaction.update(message);
  },
};
