import {
  SlashCommandBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ActionRowBuilder,
  InteractionUpdateOptions,
  InteractionReplyOptions,
} from "discord.js";
import { Mendicant } from "../../classes/Mendicant";
import GuildCommandInteraction from "../../classes/GuildCommandInteraction";

const toHHMMSS = (numSecs: string) => {
  const secNum = parseInt(numSecs, 10);
  const hours = Math.floor(secNum / 3600)
    .toString()
    .padStart(2, "0");
  const minutes = Math.floor((secNum - Number(hours) * 3600) / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (secNum - Number(hours) * 3600 - Number(minutes) * 60)
    .toString()
    .padStart(2, "0");
  return hours !== "00"
    ? `${hours}:${minutes}:${seconds}`
    : `${minutes}:${seconds}`;
};

export function getQueueMessage(
  queue: any[],
  index: number,
  mendicant: Mendicant
): InteractionUpdateOptions {
  const maxItems = 8;
  let totalPages = Math.floor(queue.length / maxItems);
  if (!(queue.length % maxItems)) {
    totalPages--;
  }
  //if button is pressed after queue has lost elements, index might become higher than totalPages
  while (index > totalPages && index > 0) {
    index--;
  }
  let j = 0;
  const items: Array<any> = [];

  if (index === 0 && queue.length) {
    items[0] = {
      title: `**▶️ ${queue[0].title}**`,
      link: `https://www.youtube.com/watch?v=${queue[0].id}`,
      length: `${toHHMMSS(queue[0].length)}`,
    };
  }
  if (index === 0) {
    j = 1;
  }
  for (let i = index * maxItems + j; i < queue.length; i++) {
    items[j] = {
      title: `**${i}:** ${queue[i].title}`,
      link: `https://www.youtube.com/watch?v=${queue[i].id}`,
      length: `${toHHMMSS(queue[i].length)}`,
    };
    j++;
  }
  const fields: Array<any> = items.map((item) => ({
    name: item.title,
    value: `${item.length} | [Link](${item.link})`,
  }));

  const embed = new EmbedBuilder()
    .setDescription(`Track List`)
    .setColor(mendicant.color)
    .addFields(fields)
    .setFooter({ text: `${index + 1}/${totalPages + 1}` });

  const skip = new ButtonBuilder()
    .setCustomId(`skip ${index}`)
    .setStyle(ButtonStyle.Secondary)
    .setEmoji("⏭️");

  const shuffle = new ButtonBuilder()
    .setCustomId(`shuffle ${index}`)
    .setStyle(ButtonStyle.Secondary)
    .setEmoji("🔀");

  const stop = new ButtonBuilder()
    .setCustomId(`stop ${index}`)
    .setStyle(ButtonStyle.Secondary)
    .setEmoji("⏹️");

  const refresh = new ButtonBuilder()
    .setCustomId(`Q ${index}`)
    .setStyle(ButtonStyle.Secondary)
    .setEmoji("🔄");

  const prev = new ButtonBuilder()
    .setCustomId(`Q ${index ? index - 1 : totalPages} P`)
    .setStyle(ButtonStyle.Secondary)
    .setEmoji("⬅️");

  const next = new ButtonBuilder()
    .setCustomId(`Q ${index === totalPages ? 0 : index + 1} N`)
    .setStyle(ButtonStyle.Secondary)
    .setEmoji("➡️");

  const actionRow1 = new ActionRowBuilder<ButtonBuilder>().addComponents(
    shuffle,
    skip,
    stop
  );
  const actionRow2 = new ActionRowBuilder<ButtonBuilder>().addComponents(
    prev,
    refresh,
    next
  );

  const components = totalPages !== 0 ? [actionRow1, actionRow2] : [actionRow1];

  return {
    embeds: [embed],
    components,
  };
}

export default {
  data: new SlashCommandBuilder()
    .setName("queue")
    .setDescription("get the music queue"),

  async execute(interaction: GuildCommandInteraction, mendicant: Mendicant) {
    console.log(`${interaction.member.displayName} used /queue`);

    const queue = mendicant.queues.find(
      (q) => q.id === interaction.guild.id
    )?.queue;
    if (!queue || !queue.length) {
      await interaction.reply({
        content: "Queue is empty",
        embeds: [],
        ephemeral: false,
      });
      return;
    }
    const message = getQueueMessage(
      queue,
      0,
      mendicant
    ) as InteractionReplyOptions;

    await interaction.reply(message);
  },

  usage: "",
};
