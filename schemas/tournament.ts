import type { Document } from "mongoose";
import { Schema, model } from "mongoose";
import type { IRound } from "./round";
import { roundSchema } from "./round";

export interface ITournament extends Document {
  id: string;
  type: number;
  name: string;
  host: string;
  players: string[];
  playerCount: number;
  winnerRounds: IRound[];
  loserRounds: IRound[];
  currentBracket: number;
  currentWinner: number;
  currentLoser: number;
  currentMatch: number;
  open: boolean;
}

const tournamentSchema = new Schema<ITournament>({
  _id: { type: Schema.Types.ObjectId },
  id: { type: String },
  type: { type: Number },
  name: { type: String },
  host: { type: String },
  players: { type: [String] },
  playerCount: { type: Number },
  winnerRounds: { type: [roundSchema] },
  loserRounds: { type: [roundSchema] },
  currentBracket: { type: Number },
  currentWinner: { type: Number },
  currentLoser: { type: Number },
  currentMatch: { type: Number },
  open: { type: Boolean },
});

export default model<ITournament>(
  "Tournament",
  tournamentSchema,
  "tournaments"
);
