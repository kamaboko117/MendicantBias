import { ButtonInteraction } from "discord.js";
import { getQueueMessage } from "../../commands/music/queue";
import { Mendicant } from "../../classes/Mendicant";

export default {
  data: {
    name: "queue",
  },
  async execute(interaction: ButtonInteraction, mendicant: Mendicant) {
    const idsplit = interaction.customId.split(" ");
    const index = Number(idsplit[1]);
    const queue = mendicant.queues.find(
      (q) => q.id === interaction.guild?.id
    )?.queue;

    if (!queue || !queue.length) {
      await interaction.update({
        content: "Queue is empty",
        embeds: [],
        components: [],
      });
      return;
    }

    const message = getQueueMessage(queue, index, mendicant);
    await interaction.update(message);
  },
};
