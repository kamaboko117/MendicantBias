import { Schema, model } from "mongoose";
import { matchSchema } from "./match.js";

export const roundSchema = new Schema({
  _id: Schema.Types.ObjectId,
  name: String,
  numPlayers: Number,
  matches: [matchSchema],
  winnerBracket: Boolean,
  minor: Boolean,
});

export default model("Round", roundSchema, "rounds");
