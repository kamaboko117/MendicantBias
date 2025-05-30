import type { ModalSubmitFields } from "discord.js";
import type {
  MatchScore,
  OsuApiEvent,
  OsuApiGameEvent,
  OsuApiScore,
  OsuApiUser,
} from "../types";

// removes inactive users, such as the match referee
export const getActiveUsers = (users: OsuApiUser[], scores: OsuApiScore[]) => {
  const userIds = scores.map((score) => score.user_id);

  return users.filter((user) => userIds.includes(user.id));
};

export const createMatchScore = (users: OsuApiUser[]): MatchScore => {
  return users.map((user) => ({
    user: user,
    score: 0,
  }));
};

export const skipWarmupEvents = (
  events: OsuApiEvent[],
  skip: number
): OsuApiGameEvent[] => {
  const gameEvents: OsuApiGameEvent[] = [];
  let warmupCount = 0;

  for (const event of events) {
    if (event.detail.type === "other" && event.game) {
      warmupCount++;
    }

    if (warmupCount > skip && event.detail.type === "other" && event.game) {
      gameEvents.push(event as OsuApiGameEvent);
    }
  }

  return gameEvents;
};

export const createDraft = (
  players: OsuApiUser[],
  fields: ModalSubmitFields
) => {
  const draft1 = fields.getTextInputValue("player1ProtectInput").split(" ");
  const draft2 = fields.getTextInputValue("player2ProtectInput").split(" ");

  return {
    player1: players[0],
    player2: players[1],
    roll1: fields.getTextInputValue("player1RollsInput"),
    roll2: fields.getTextInputValue("player2RollsInput"),
    protect1: draft1.length > 1 ? draft1[0] : null,
    protect2: draft2.length > 1 ? draft2[0] : null,
    ban1: draft1.length > 1 ? draft1[1] : draft1[0],
    ban2: draft2.length > 1 ? draft2[1] : draft2[0],
  };
};
