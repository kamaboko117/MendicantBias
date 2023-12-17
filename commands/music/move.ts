import { SlashCommandBuilder } from "@discordjs/builders";
import { getVoiceConnection } from "@discordjs/voice";
import { Queue } from "../../classes/Queue";
import GuildCommandInteraction from "../../classes/GuildCommandInteraction";
import { Mendicant } from "../../classes/Mendicant";

export const mendicantMove = (queue: any[], src: number, dst: number) => {
  console.log(`mendicantMove(${src}, ${dst})`);
  if (src === dst) {
    return;
  }
  if (src < 1 || src > queue.length) {
    return;
  }
  if (dst < 1 || dst > queue.length) {
    return;
  }
  const item = queue[src];
  queue.splice(src, 1);
  queue.splice(dst, 0, item);
};

export default {
  data: new SlashCommandBuilder()
    .setName("move")
    .setDescription("Change an item's position in the queue")
    .addIntegerOption((option) =>
      option
        .setName("from")
        .setDescription("the item's current index")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("to")
        .setDescription("the item's destination index")
        .setRequired(false)
    ),

  async execute(interaction: GuildCommandInteraction, mendicant: Mendicant) {
    const option1 = interaction.options.getInteger("from")!;
    let option2 = interaction.options.getInteger("to")!;

    if (!option2 || option2 < 1) {
      option2 = 1;
    }
    console.log(
      `${interaction.member.displayName} used /move ${option1} ${option2}`
    );

    const { voice } = interaction.member;
    if (!voice.channelId) {
      interaction.reply("Error: You are not in a voice channel");
      return;
    }
    const connection = getVoiceConnection(interaction.guild.id);
    if (!connection) {
      await interaction.reply({
        content: "Nothing to move",
      });
      return;
    }

    let queue = mendicant.queues.find(
      (queue) => queue.id === interaction.guild.id
    );
    if (queue) {
      queue = queue.queue;
    }
    if (option2 > queue.length) {
      option2 = queue.length;
    }

    mendicantMove(queue, option1, option2);

    await interaction.reply({
      content: "Done",
    });
  },

  usage: "",
};
