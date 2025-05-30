export type OsuApiMatch = {
  name: string;
  game: object;
  match: OsuApiMatch;
  users: OsuApiUser[];
  start_time: string;
  events: OsuApiEvent[];
};

export type OsuApiScore = {
  user_id: number;
  mods: string[];
  score: number;
  mode: "osu" | "taiko" | "fruits" | "mania";
};
export type OsuApiGame = {
  scores: OsuApiScore[];
  beatmap: {
    version: string;
    beatmapset: {
      artist: string;
      title: string;
    };
  };
};
export type OsuApiEvent = {
  detail: {
    type: string;
  };
  game?: OsuApiGame;
};

export type OsuApiGameEvent = {
  detail: {
    type: "other";
  };
  game: OsuApiGame;
};

export type OsuApiUser = {
  id: number;
  username: string;
};

export type MatchScore = {
  user: OsuApiUser;
  score: number;
}[];

export type Draft = {
  player1: OsuApiUser;
  player2: OsuApiUser;
  roll1: string;
  roll2: string;
  protect1: string | null;
  protect2: string | null;
  ban1: string;
  ban2: string;
};
