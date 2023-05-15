import { getVoiceConnection } from "@discordjs/voice";

export default {
  data: {
    name: "stop",
  },
  async execute(interaction, client) {
    console.log(`${interaction.member.displayName} used stop button`);
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
        content: "Nothing to stop",
      });
      return;
    }

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
    let subscription = connection.state.subscription;
    let player = subscription.player;

    while (!queue.isEmpty) queue.dequeue();
    player.stop();

    let message = { content: "Queue cleared", embeds: [] };
    interaction.update(message);
  },
};
