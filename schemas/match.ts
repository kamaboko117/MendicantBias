import { Schema, model } from "mongoose";

export interface IMatch {
  _id: string;
  matchId: number;
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

export const matchSchema = new Schema<IMatch>({
  _id: Schema.Types.ObjectId,
  matchId: Number,
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

export default model<IMatch>("Match", matchSchema, "matches");
