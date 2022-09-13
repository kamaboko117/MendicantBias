const { Schema, model } = require('mongoose');

const matchSchema = new Schema({
    _id: Schema.Types.ObjectId,
    matchId: Number,
    playerLeft: String,
    playerRight: String,
    votesLeft: Number,
    votesRight: Number,
    membersLeft: [String],
    membersRight: [String],
    open: Boolean,
    winner: Schema.Types.Mixed,
});

module.exports.Match = model("Match", matchSchema, "matches");
module.exports.matchSchema = matchSchema;