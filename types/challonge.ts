export type ChallongeParticipant = {
  id: number;
  name: string;
};

export type ChallongeMatchType = {
  id: number;
  suggested_play_order: number;
  optional: boolean;
  state: "open" | "complete" | "pending";
  round: number;
  player1_id: number;
  player2_id: number;
  winner_id: number;
};
