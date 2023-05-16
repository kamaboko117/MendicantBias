import { SlashCommandBuilder } from "@discordjs/builders";
import { getVoiceConnection } from "@discordjs/voice";

export default {
  data: new SlashCommandBuilder()
    .setName("clear")
    .setDescription("Empty the current queue"),

  async execute(interaction, client) {
    console.log(`${interaction.member.displayName} used /clear`);
    const { voice } = interaction.member;
    if (!voice.channelId) {
      interaction.reply("Error: You are not in a voice channel");
      return;
    }
    const connection = getVoiceConnection(interaction.guild.id);
    if (!connection) {
      await interaction.reply({
        content: "Nothing to clear",
      });
      return;
    }

    let subscription = connection.state.subscription;
    let player = subscription.player;
    let queue = client.queues.find(
      (queue) => queue.id === interaction.guild.id
    );
    if (queue) {
      queue = queue.queue;
    }
    queue.length = 0;

    player.stop();

    await interaction.reply({
      content: "Cleared",
    });
  },

  usage: "",
};
