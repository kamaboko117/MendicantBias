import { Schema, model } from "mongoose";
import { roundSchema } from "./round.js";

const tournamentSchema = new Schema({
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

export default model("Tournament", tournamentSchema, "tournaments");