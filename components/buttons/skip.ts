import { getVoiceConnection } from "@discordjs/voice";
import GuildButtonInteraction from "../../classes/GuildButtonInteraction.js";
import { Mendicant } from "../../classes/Mendicant.js";
import { getQueueMessage } from "../../commands/music/queue";

export default {
  data: {
    name: "skip",
  },
  async execute(interaction: GuildButtonInteraction, mendicant: Mendicant) {
    mendicant.logInteraction(interaction);
    const idsplit = interaction.customId.split(" ");
    const index = Number(idsplit[1]);

    const { voice } = interaction.member;
    if (!voice.channelId) {
      interaction.reply("Error: You are not in a voice channel");
      return;
    }
    const connection = getVoiceConnection(interaction.guild.id);
    if (!connection || connection.state.status === "destroyed") {
      await interaction.reply({
        content: "Nothing to skip(1)",
      });
      return;
    }

    const subscription = connection.state.subscription;
    const player = subscription?.player;

    if (!player) {
      await interaction.reply({
        content: "Nothing to skip(2)",
      });
      return;
    }

    //player's event listener on idle will play next resource automatically
    player.stop();

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

    setTimeout(() => {
      const message = getQueueMessage(queue!, index, mendicant);
      interaction.update(message);
    }, 1_000);
  },
};
