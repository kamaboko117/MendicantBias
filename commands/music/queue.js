// const {
//   SlashCommandBuilder,
//   EmbedBuilder,
//   ButtonBuilder,
//   ButtonStyle,
//   ActionRowBuilder,
// } = require("discord.js");
import {
  SlashCommandBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ActionRowBuilder,
} from "discord.js";

const toHHMMSS = (numSecs) => {
  let secNum = parseInt(numSecs, 10);
  let hours = Math.floor(secNum / 3600)
    .toString()
    .padStart(2, "0");
  let minutes = Math.floor((secNum - hours * 3600) / 60)
    .toString()
    .padStart(2, "0");
  let seconds = (secNum - hours * 3600 - minutes * 60)
    .toString()
    .padStart(2, "0");
  if (hours === "00") return `${minutes}:${seconds}`;
  return `${hours}:${minutes}:${seconds}`;
};

export function getQueueMessage(queue, index, client) {
  let maxItems = 8;
  let fields = [];
  let items = [];
  let totalPages = Math.floor(queue.length / maxItems);
  if (!(queue.length % maxItems)) {
    totalPages--;
  }
  //if button is pressed after queue has lost elements, index might become higher than totalPages
  while (index > totalPages && index > 0) {
    index--;
  }
  let j = 0;

  if (index === 0 && queue.length) {
    items[0] = new Object();
    items[0].title = `**▶️ ${queue[0].title}**`;
    items[0].link = `https://www.youtube.com/watch?v=${queue[0].id}`;
    items[0].length = `${toHHMMSS(queue[0].length)}`;
  }
  if (index === 0) {
    j = 1;
  }
  for (let i = index * maxItems + j; i < queue.length; i++) {
    items[j] = new Object();
    items[j].title = `**${i}:** ${queue[i].title}`;
    items[j].link = `https://www.youtube.com/watch?v=${queue[i].id}`;
    items[j++].length = `${toHHMMSS(queue[i].length)}`;
  }
  let i = 0;
  for (const item of items) {
    fields[i] = new Object();
    fields[i].name = item.title;
    fields[i++].value = `${item.length} | [Link](${item.link})`;
    if (i === maxItems) break;
  }
  const embed = new EmbedBuilder()
    .setDescription(`Track List`)
    .setColor(client.color)
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
  if (totalPages !== 0) {
    const prev = new ButtonBuilder()
      .setCustomId(`Q ${index ? index - 1 : totalPages} P`)
      .setStyle(ButtonStyle.Secondary)
      .setEmoji("⬅️");
    const next = new ButtonBuilder()
      .setCustomId(`Q ${index === totalPages ? 0 : index + 1} N`)
      .setStyle(ButtonStyle.Secondary)
      .setEmoji("➡️");
    return {
      embeds: [embed],
      components: [
        new ActionRowBuilder().addComponents(shuffle, skip, stop),
        new ActionRowBuilder().addComponents(prev, refresh, next),
      ],
    };
  }
  return {
    embeds: [embed],
    components: [
      new ActionRowBuilder().addComponents(shuffle, skip, stop),
      new ActionRowBuilder().addComponents(refresh),
    ],
  };
}

export default {
  data: new SlashCommandBuilder()
    .setName("queue")
    .setDescription("get the music queue"),

  async execute(interaction, client) {
    console.log(`${interaction.member.displayName} used /queue`);

    let queue = client.queues.find(
      (queue) => queue.id === interaction.guild.id
    );
    if (queue) queue = queue.queue;
    if (!queue || !queue.length) {
      await interaction.reply({
        content: "Queue is empty",
        embeds: [],
        ephemeral: false,
      });
      return;
    }
    let message = getQueueMessage(queue, 0, client);

    await interaction.reply(message);
  },

  usage: "",
};
