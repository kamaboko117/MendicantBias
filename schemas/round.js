Match = require `./match`;
const { Schema, model } = require('mongoose');

const roundSchema = new Schema({
    _id: Schema.Types.ObjectId,
    name: String,
    numPlayers: Number,
    matches: Match[Number / 2],
    winnerBracket: Boolean
});