import { APIEmbedField } from "discord.js";
import { MatchScore, OsuApiEvent, OsuApiScore, OsuApiUser } from "../types";

const updateMatchScore = (matchScore: MatchScore, scores: OsuApiScore[]) => {
  if (
    scores[0].mode === "catch" &&
    scores.every((score) => score.score < 300000)
  ) {
    // assume players are playing DODGE THE BEAT
    scores[0].score = -scores[0].score;
    scores[1].score = -scores[1].score;
  }
  if (scores[0].score > scores[1].score) {
    const user = matchScore.find((s) => s.user.id === scores[0].user_id);
    if (user) {
      user.score += 1;
    }
  } else if (scores[0].score < scores[1].score) {
    const user = matchScore.find((s) => s.user.id === scores[1].user_id);
    if (user) {
      user.score += 1;
    }
  }
};

const printScore = (matchScore: MatchScore) => {
  const score = matchScore.map((s) => s.score);
  return `${score[0]} - ${score[1]}`;
};

export const getEventFields = (
  events: OsuApiEvent[],
  users: OsuApiUser[],
  matchScore: MatchScore
): APIEmbedField[] => {
  const fields: APIEmbedField[] = [];

  for (const event of events) {
    if (event.detail.type !== "other" || !event.game) {
      continue;
    }

    const { beatmapset } = event.game.beatmap;
    const { beatmap } = event.game;
    const fieldTitle = `${beatmapset.artist} - ${beatmapset.title} [${beatmap.version}]`;

    const { scores } = event.game;
    const gameUsers: Record<number, string> = {};

    for (const score of scores) {
      const user = users.find((u) => u.id === score.user_id);
      if (!user) continue;

      const filteredScoreMods = score.mods.filter((value) => value !== "NF");
      const mods =
        filteredScoreMods.length > 0
          ? `**[${filteredScoreMods.join("")}]**`
          : "**[NM]**";

      gameUsers[user.id] = `${mods} ${user.username}`;
    }

    if (Object.keys(gameUsers).length < 2) continue;

    updateMatchScore(matchScore, scores);

    // Filter only users from matchScore that exist in gameUsers
    const matchPlayers = matchScore.filter((ms) => gameUsers[ms.user.id]);

    const [p1, p2] = matchPlayers;
    console.log(p1, p2);

    fields.push({
      name: fieldTitle,
      value: `${gameUsers[p1.user.id]} ${printScore(matchScore)} ${
        gameUsers[p2.user.id]
      }`,
    });
  }

  fields.push({ name: "\u200B", value: "\u200B" });

  return fields;
};
