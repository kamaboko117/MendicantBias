import {
  APIEmbedField,
  ChatInputCommandInteraction,
  EmbedBuilder,
  ModalSubmitInteraction,
  SlashCommandBuilder,
} from "discord.js";
import { Mendicant } from "../../../classes/Mendicant";
import { getMatch } from "./helpers/api";
import { OsuApiMatch } from "./helpers/types";
import { getConclusionField } from "./helpers/utils/getConclusionFields";
import { getDraftFields } from "./helpers/utils/getDraftFields";
import { getEventFields } from "./helpers/utils/getEventFields";
import {
  createDraft,
  createMatchScore,
  getActiveUsers,
  skipWarmupEvents,
} from "./helpers/utils/utils";
import { getModal } from "./matchFeedModal";

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
    const scores = events.map((event) => event.game.scores).flat();
    const players = getActiveUsers(users, scores);

    await interaction.showModal(getModal(players, match.name));

    const filter = (i: ModalSubmitInteraction) =>
      i.customId === "match-feed-form" && i.user.id === interaction.user.id;

    const submitted = await interaction
      .awaitModalSubmit({
        filter,
        time: 60_000 * 15,
      })
      .catch((err) => {
        interaction.followUp({
          content: err.toString(),
          flags: ["Ephemeral"],
        });
      });

    if (!submitted) {
      return;
    }

    const { fields } = submitted;

    const draft = createDraft(players, fields);
    const matchScore = createMatchScore(players);

    const eventFields: APIEmbedField[] = getEventFields(
      events,
      players,
      matchScore
    );
    const draftFields = getDraftFields(draft);
    const conclusionField = getConclusionField(matchScore);

    const embed = new EmbedBuilder()
      .setTitle(match.name)
      .setURL(`https://osu.ppy.sh/community/matches/${matchId}`)
      .setColor(mendicant.color)
      .addFields([draftFields, eventFields, conclusionField].flat())
      .setTimestamp(new Date(match.start_time));

    submitted.reply({
      embeds: [embed],
    });
  },
};
