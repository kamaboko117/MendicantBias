import { SlashCommandBuilder } from "@discordjs/builders";
import { getVoiceConnection } from "@discordjs/voice";
import { InteractionContextType } from "discord.js";
import type { GuildCommandInteraction } from "../../classes/GuildCommandInteraction";
import type { Mendicant } from "../../classes/Mendicant";
import { mendicantMove } from "./helpers/mendicantMove";

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
    )
    .setContexts([InteractionContextType.Guild]),

  async execute(interaction: GuildCommandInteraction, mendicant: Mendicant) {
    const option1 = interaction.options.getInteger("from", true)!;
    let option2 = interaction.options.getInteger("to")!;

    if (!option2 || option2 < 1) {
      option2 = 1;
    }
    console.log(
      `${interaction.user.username} used /move ${option1} ${option2}`
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

    const queue = mendicant.queues.find(
      (queue) => queue.id === interaction.guild.id
    )?.items;
    if (!queue) {
      return;
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
