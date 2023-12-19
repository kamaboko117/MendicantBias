import { SlashCommandBuilder } from "@discordjs/builders";
import { getVoiceConnection } from "@discordjs/voice";
import { Mendicant } from "../../classes/Mendicant";
import GuildCommandInteraction from "../../classes/GuildCommandInteraction";

export function mendicantShuffle(queue: any[]) {
  const tmpArray = [...queue.slice(1)];
  tmpArray.sort(() => Math.random() - 0.5);
  tmpArray.push(queue[0]);
  queue.length = 0;
  while (tmpArray.length) {
    queue.push(tmpArray.pop());
  }
}

export default {
  data: new SlashCommandBuilder()
    .setName("shuffle")
    .setDescription("Shuffles the current playlist"),

  async execute(interaction: GuildCommandInteraction, mendicant: Mendicant) {
    console.log(`${interaction.member.displayName} used /shuffle`);
    const { voice } = interaction.member;
    if (!voice.channelId) {
      await interaction.reply("Error: You are not in a voice channel");
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
      (q) => q.id === interaction.guild.id
    )?.queue;
    mendicantShuffle(queue);

    await interaction.reply({
      content: "Done",
    });
  },

  usage: "",
};
