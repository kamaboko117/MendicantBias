const { Schema, model } = require('mongoose');
const matchSchema = new Schema({
    _id: Schema.Types.ObjectId,
    matchId: Number,
    playerLeft: String,
    playerRight: String,
    votesLeft: Number,
    votesRight: Number,
    open: Boolean
});

module.exports = model("Match", matchSchema, "matches");