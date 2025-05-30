import { getVoiceConnection } from "@discordjs/voice";
import type { GuildButtonInteraction } from "../../classes/GuildButtonInteraction";
import type { Mendicant } from "../../classes/Mendicant";
import { getQueueMessage } from "../../commands/music/queue";
import { mendicantShuffle } from "../../commands/music/shuffle";

export default {
  data: {
    name: "shuffle",
  },
  async execute(interaction: GuildButtonInteraction, mendicant: Mendicant) {
    console.log(`${interaction.member.toString()} used shuffle button`);
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
        content: "Nothing to shuffle",
      });
      return;
    }

    const queue = mendicant.queues.find(
      (queue) => queue.id === interaction.guild.id
    )?.items;

    if (!queue || !queue.length) {
      await interaction.update({
        content: "Queue is empty",
        embeds: [],
      });
      return;
    }

    mendicantShuffle(queue);

    setTimeout(() => {
      const message = getQueueMessage(queue, index, mendicant);
      interaction.update(message);
    }, 1_000);
  },
};
