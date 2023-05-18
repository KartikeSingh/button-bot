const { model, Schema } = require('mongoose');

module.exports = model('button_bot_entry', new Schema({
    id: String,
    guild: String,
    type: Number,
    replies: {
        type: [String],
        default: []
    },
}));