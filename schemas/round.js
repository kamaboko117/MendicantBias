const { Schema, model } = require('mongoose');

const roundSchema = new Schema({
    _id: Schema.Types.ObjectId,
    name: String,
    numPlayers: Number,
    matches: [Schema.ObjectId],
    winnerBracket: Boolean
});

module.exports = model("Round", roundSchema, "rounds");