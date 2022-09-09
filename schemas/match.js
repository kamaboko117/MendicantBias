const { Schema, model } = require('mongoose');

const matchSchema = new Schema({
    _id: Schema.Types.ObjectId,
    matchId: Number,
    playerLeft: Schema.Types.Mixed,
    playerRight: Schema.Types.Mixed,
    votesLeft: Number,
    votesRight: Number,
    membersLeft: [String],
    membersRight: [String],
    open: Boolean,
    winner: Schema.Types.Mixed,
});

module.exports = model("Match", matchSchema, "matches");