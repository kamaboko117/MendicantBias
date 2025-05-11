import { APIEmbedField } from "discord.js";

const updateMatchScore = (matchScore: MatchScore, scores: OsuApiScore[]) => {
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

export const getFields = (
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
    const gameUsers = [];

    for (const score of scores) {
      const user = users.find((u) => u.id === score.user_id);

      if (!user) {
        continue;
      }

      const mods = score.mods.reduce((acc: string, mod: string, idx, arr) => {
        if (idx === 0) {
          acc = "**[";
        }

        acc += mod;

        if (idx === arr.length - 1) {
          acc += "]**";
        }

        return acc;
      }, `**[NM]**`);

      gameUsers.push(`${mods} ${user.username}`);
    }

    if (gameUsers.length < 2) {
      continue;
    }

    updateMatchScore(matchScore, scores);

    fields.push({
      name: fieldTitle,
      value: `${
        gameUsers[
          gameUsers.findIndex((user) =>
            user.includes(matchScore[0].user.username)
          )
        ]
      } ${printScore(matchScore)} ${
        gameUsers[
          gameUsers.findIndex((user) =>
            user.includes(matchScore[1].user.username)
          )
        ]
      }`,
    });
  }

  return fields;
};

export const createMatchScore = (users: OsuApiUser[]) => {
  return users.map((user) => ({
    user: user,
    score: 0,
  }));
};

export const skipWarmupEvents = (
  events: OsuApiEvent[],
  skip: number
): OsuApiEvent[] => {
  const warmupEvents: OsuApiEvent[] = [];
  let warmupCount = 0;

  for (const event of events) {
    if (event.detail.type === "other" && event.game) {
      warmupCount++;
    }

    if (warmupCount > skip) {
      warmupEvents.push(event);
    }
  }

  return warmupEvents;
};
