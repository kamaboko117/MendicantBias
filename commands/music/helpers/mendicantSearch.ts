import {
  ActionRowBuilder,
  APIEmbedField,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} from "discord.js";
import youtubesearchapi from "youtube-search-api";
import GuildCommandInteraction from "../../../classes/GuildCommandInteraction";
import { Mendicant } from "../../../classes/Mendicant";

export const mendicantSearch = async (
  option1: string,
  interaction: GuildCommandInteraction,
  mendicant: Mendicant,
  index: number
) => {
  const options = [{ type: "video" }];
  const results = await youtubesearchapi.GetListByKeyword(
    option1,
    false,
    5,
    options
  );

  if (!results.items.length) {
    interaction.reply(`No results for "${option1}"`);
    return;
  }

  const titles: string[] = results.items.map(
    (result: { title: any }, i: number) => `**${i + 1}:** ${result.title}`
  );

  const fields: APIEmbedField[] = titles.map((title) => ({
    name: "\u200B",
    value: title,
  }));

  const embed = new EmbedBuilder()
    .setDescription(`results for **${option1}**: select a track`)
    .setColor(mendicant.color)
    .addFields(fields);

  const buttons = results.items.slice(0, 5).map((result: any, i: number) => {
    const customID = `P ${result.id} ${index ? index : "0"}`.substring(0, 99);
    return new ButtonBuilder()
      .setCustomId(customID)
      .setStyle(ButtonStyle.Secondary)
      .setLabel(`${i + 1}`);
  });

  await interaction.reply({
    ephemeral: false,
    embeds: [embed],
    components: [new ActionRowBuilder<ButtonBuilder>().addComponents(buttons)],
  });
};
