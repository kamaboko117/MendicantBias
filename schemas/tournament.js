Match = require(`./match`);
const { Schema, model } = require('mongoose');

const tournamentSchema = new Schema({
    id: Schema.Types.ObjectId,
    name: String,
    players: [String],
    playerCount: Number,
    winnerRounds: [Schema.ObjectId],
    loserRounds: [Schema.ObjectId]
});

module.exports = model("Tournament", tournamentSchema, "tournaments");