type OsuApiMatch = {
  name: string;
  game: {};
  match: OsuApiMatch;
  users: OsuApiUser[];
  start_time: string;
  events: OsuApiEvent[];
};

type OsuApiScore = {
  user_id: number;
  mods: string[];
  score: number;
};

type OsuApiEvent = {
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

type OsuApiUser = {
  id: number;
  username: string;
};

type MatchScore = {
  user: OsuApiUser;
  score: number;
}[];
