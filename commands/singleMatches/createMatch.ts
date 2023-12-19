import Match from "../../schemas/match";
import {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  GuildEmoji,
} from "discord.js";
import mongoose from "mongoose";
import emojiRegex from "emoji-regex";
import GuildCommandInteraction from "../../classes/GuildCommandInteraction.js";
import { Mendicant } from "../../classes/Mendicant.js";

function isUnicode(emoji: GuildEmoji | string): emoji is string {
  return typeof emoji === "string";
}

export default {
  data: new SlashCommandBuilder()
    .setName("create-match")
    .setDescription("Creates an emotedokai match")
    .addStringOption((option) =>
      option
        .setName("emote1")
        .setDescription("the first emote")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("emote2")
        .setDescription("the second emote")
        .setRequired(true)
    ),

  async execute(interaction: GuildCommandInteraction, mendicant: Mendicant) {
    const option1 = interaction.options.getString("emote1")!;
    const option2 = interaction.options.getString("emote2")!;
    console.log(
      `${interaction.member.displayName} used /create-match ${option1} ${option2}`
    );

    const re1 = emojiRegex();
    const re2 = emojiRegex();
    console.log(`option1: ${option1}`);
    console.log(`option2: ${option2}`);

    let emote1: GuildEmoji | undefined | string = mendicant.emojis.cache.find(
      (emoji) => emoji.name === option1.split(":")[1]
    );
    let unicode1 = false;
    let emote2: GuildEmoji | undefined | string = mendicant.emojis.cache.find(
      (emoji) => emoji.name === option2.split(":")[1]
    );
    let unicode2 = false;

    //if no emotes are found in cache, we check if the emotes are unicode
    if (!emote1) {
      unicode1 = true;
      let unicodeEmoji1 = re1.exec(option1);
      if (unicodeEmoji1) {
        emote1 = unicodeEmoji1[0];
      }
    }
    if (!emote2) {
      unicode2 = true;
      let unicodeEmoji2 = re2.exec(option2);
      if (unicodeEmoji2) {
        emote2 = unicodeEmoji2[0];
      }
    }
    if (!emote1 || !emote2) {
      await interaction.reply({
        content: "Emojis missing from database: add me to the source server",
      });
      return;
    }

    let matchId = 1; //await Match.estimatedDocumentCount();
    let matchProfile = await Match.findOne({ matchId: matchId });
    while (matchProfile) {
      matchId++;
      matchProfile = await Match.findOne({ matchId: matchId });
    }
    console.log(matchId);
    matchProfile = new Match({
      _id: new mongoose.Types.ObjectId(),
      matchId: matchId,
      playerLeft: `${emote1}`,
      playerRight: `${emote2}`,
      votesLeft: 0,
      votesRight: 0,
      open: true,
    });
    await matchProfile.save().catch(console.error);
    mendicant.matchCount++;

    //create embed
    const embed = new EmbedBuilder()
      .setTitle(`Match ${matchProfile.matchId}`)
      .setColor(mendicant.color)
      .setURL("https://challonge.com");

    //create buttons
    const button1 = new ButtonBuilder()
      .setCustomId(matchProfile._id + " left")
      .setStyle(ButtonStyle.Secondary)
      .setEmoji(isUnicode(emote1) ? emote1 : emote1.id);
    const button2 = new ButtonBuilder()
      .setCustomId(matchProfile._id + " right")
      .setStyle(ButtonStyle.Secondary)
      .setEmoji(isUnicode(emote2) ? emote2 : emote2.id);

    await interaction.reply({
      content: `match ID: ${matchId}, use /reveal ${matchId} to close and show results`,
      components: [
        new ActionRowBuilder<ButtonBuilder>().addComponents(button1, button2),
      ],
    });
  },

  usage:
    "Use this command to create an emote 1v1. I will reply with your **matchID** \
    and the match. Once you are ready to display \
    the results, use `/reveal <matchID>`.\n**I cannot use an emoji if I'm not a member of the \
    emoji's source server**",
};
