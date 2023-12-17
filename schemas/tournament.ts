import { Schema, model } from "mongoose";
import { IRound, roundSchema } from "./round";

export interface ITournament {
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
    id: Schema.Types.ObjectId,
    type: Number,
    name: String,
    host: String,
    players: [String],
    playerCount: Number,
    winnerRounds: [roundSchema],
    loserRounds: [roundSchema],
    currentBracket: Number,
    currentWinner: Number,
    currentLoser: Number,
    currentMatch: Number,
    open: Boolean 
});

export default model<ITournament>("Tournament", tournamentSchema, "tournaments");