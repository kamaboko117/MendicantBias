const { Schema, model } = require('mongoose');
const { matchSchema } = require('./match');

const roundSchema = new Schema({
    _id: Schema.Types.ObjectId,
    name: String,
    numPlayers: Number,
    matches: [matchSchema],
    winnerBracket: Boolean,
    minor: Boolean
});

module.exports.Round = model("Round", roundSchema, "rounds");
module.exports.roundSchema = roundSchema;