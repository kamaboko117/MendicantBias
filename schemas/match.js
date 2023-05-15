import { Schema, model } from "mongoose";

export const matchSchema = new Schema({
  _id: Schema.Types.ObjectId,
  matchId: Number,
  playerLeft: String,
  playerRight: String,
  votesLeft: Number,
  votesRight: Number,
  membersLeft: [String],
  membersRight: [String],
  open: Boolean,
  winner: String,
  loser: String,
});

export default model("Match", matchSchema, "matches");
