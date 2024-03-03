import { Schema, model, Document } from "mongoose";

export interface IChallongeTournament extends Document {
  id: number;
  name: string;
  host: string;
  players: string[];
  open: boolean;
}

const challongeTournamentSchema = new Schema<IChallongeTournament>({
  _id: { type: Schema.Types.ObjectId },
  id: { type: Number },
  name: { type: String },
  host: { type: String },
  players: { type: [String] },
  open: { type: Boolean },
});

export default model<IChallongeTournament>(
  "ChallongeTournament",
  challongeTournamentSchema,
  "challongeTournaments"
);
