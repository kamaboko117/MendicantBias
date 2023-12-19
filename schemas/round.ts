import { Schema, model } from "mongoose";
import { IMatch, matchSchema } from "./match";

export interface IRound {
  _id: string;
  name: string;
  numPlayers: number;
  matches: IMatch[];
  winnerBracket: boolean;
  minor: boolean;
}

export const roundSchema = new Schema<IRound>({
  _id: Schema.Types.ObjectId,
  name: String,
  numPlayers: Number,
  matches: [matchSchema],
  winnerBracket: Boolean,
  minor: Boolean,
});

export default model<IRound>("Round", roundSchema, "rounds");
