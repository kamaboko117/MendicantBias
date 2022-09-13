const { Schema, model } = require('mongoose');
const { matchSchema } = require('./match');

const roundSchema = new Schema({
    _id: Schema.Types.ObjectId,
    name: String,
    numPlayers: Number,
    matches: [matchSchema],
    winnerBracket: Boolean
});

module.exports = model("Round", roundSchema, "rounds");