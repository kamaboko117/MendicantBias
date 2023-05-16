import { SlashCommandBuilder } from "@discordjs/builders";
import { getVoiceConnection } from "@discordjs/voice";

export function mendicantShuffle(queue) {
  let tmpArray = [];
  for (let i = 1; i < queue.length; i++) {
    tmpArray.push(queue[i]);
  }
  tmpArray.sort(() => Math.random() - 0.5);

  tmpArray.push(queue[0]);
  queue.length = 0;
  let size = tmpArray.length;
  for (let i = 0; i < size; i++) queue.push(tmpArray.pop());
}

export default {
  data: new SlashCommandBuilder()
    .setName("shuffle")
    .setDescription("shuffles the current playlist"),

  async execute(interaction, client) {
    console.log(`${interaction.member.displayName} used /shuffle`);
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
    mendicantShuffle(queue);

    await interaction.reply({
      content: "Done",
    });
  },

  usage: "",
};
