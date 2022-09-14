const { Match } = require(`./match`);
const { Schema, model } = require('mongoose');
const { roundSchema } = require('./round');

const tournamentSchema = new Schema({
    id: Schema.Types.ObjectId,
    name: String,
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

module.exports = model("Tournament", tournamentSchema, "tournaments");