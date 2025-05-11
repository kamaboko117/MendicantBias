import { APIEmbedField } from "discord-api-types/v9";
import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";
import { Mendicant } from "../../../classes/Mendicant";
import { getMatch } from "./helpers/api";
import { createMatchScore, getFields, skipWarmupEvents } from "./helpers/utils";

export default {
  data: new SlashCommandBuilder()
    .setName("create-match-feed")
    .setDescription("Create a match feed for a given match")
    .addStringOption((option) =>
      option
        .setName("matchid")
        .setDescription("The match ID to create a feed for")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("warmups")
        .setDescription("The number of warmup maps played, defaults to 0")
        .setRequired(false)
    ),

  async execute(
    interaction: ChatInputCommandInteraction,
    mendicant: Mendicant
  ) {
    const matchId = interaction.options.getString("matchid");
    const skip = interaction.options.getInteger("warmups") || 0;

    const data: OsuApiMatch | undefined = await getMatch(
      matchId || "",
      mendicant
    );

    if (!data) {
      return interaction.reply({
        content: "Match not found",
        ephemeral: true,
      });
    }

    const { match, users } = data;
    const events = skipWarmupEvents(data.events, skip);
    const matchScore = createMatchScore(users);

    const fields: APIEmbedField[] = getFields(events, users, matchScore);

    const embed = new EmbedBuilder()
      .setTitle(match.name)
      .setURL(`https://osu.ppy.sh/community/matches/${matchId}`)
      .setColor(mendicant.color)
      .addFields(fields)
      .setTimestamp(new Date(match.start_time));

    interaction.reply({
      embeds: [embed],
      ephemeral: true,
    });
  },
};
