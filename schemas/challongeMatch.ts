import { Schema, model } from "mongoose";

export interface IChallongeMatch {
  _id: string;
  matchId: string;
  playerLeft: string;
  playerRight: string;
  votesLeft: number;
  votesRight: number;
  membersLeft: string[];
  membersRight: string[];
  open: boolean;
  winner: string;
  loser: string;
}

export const challongeMatchSchema = new Schema<IChallongeMatch>({
  _id: Schema.Types.ObjectId,
  matchId: String,
  playerLeft: String,
  playerRight: String,
  votesLeft: { type: Number, default: 0 },
  votesRight: { type: Number, default: 0 },
  membersLeft: [String],
  membersRight: [String],
  open: Boolean,
  winner: String,
  loser: String,
});

export default model<IChallongeMatch>(
  "ChallongeMatch",
  challongeMatchSchema,
  "challongeMatches"
);
