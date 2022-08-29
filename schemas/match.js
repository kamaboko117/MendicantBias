const { Schema, model } = require('mongoose');
const matchSchema = new Schema({
    _id: Schema.Types.ObjectId,
    matchId: Number,
    playerLeft: String,
    playerRight: String,
});

module.exports = model("Match", matchSchema, "matches");