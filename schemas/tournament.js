Match = require `./match`;
const { Schema, model } = require('mongoose');

const tournamentSchema = new Schema({
    id: Schema.Types.ObjectId,
});
