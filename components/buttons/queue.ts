import { ButtonInteraction } from "discord.js";
import { getQueueMessage } from "../../commands/music/queue";
import { Mendicant } from "../../classes/Mendicant";

export default {
  data: {
    name: "queue",
  },
  async execute(interaction: ButtonInteraction, mendicant: Mendicant) {
    let idsplit = interaction.customId.split(" ");
    let index = Number(idsplit[1]);
    let queue = mendicant.queues.find(
      (queue) => queue.id === interaction.guild?.id
    );
    if (queue) {
      queue = queue.queue;
    }
    if (!queue || !queue.length) {
      await interaction.update({
        content: "Queue is empty",
        embeds: [],
        components: [],
      });
      return;
    }
    let message = getQueueMessage(queue, index, mendicant);

    await interaction.update(message);
  },
};
