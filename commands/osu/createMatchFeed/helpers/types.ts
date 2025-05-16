export type OsuApiMatch = {
  name: string;
  game: {};
  match: OsuApiMatch;
  users: OsuApiUser[];
  start_time: string;
  events: OsuApiEvent[];
};

export type OsuApiScore = {
  user_id: number;
  mods: string[];
  score: number;
};

export type OsuApiEvent = {
  detail: {
    type: string;
  };
  game?: {
    scores: OsuApiScore[];
    beatmap: {
      version: string;
      beatmapset: {
        artist: string;
        title: string;
      };
    };
  };
};

export type OsuApiUser = {
  id: number;
  username: string;
};

export type MatchScore = {
  user: OsuApiUser;
  score: number;
}[];
