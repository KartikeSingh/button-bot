const { model, Schema } = require('mongoose');

module.exports = model('guild_buttonbot', new Schema({
    id: String,
    subscription: {
        tier: {
            type: Number,
            default: -1
        },
        since: {
            type: Number,
            default: -1
        },
        till: {
            type: Number,
            default: -1
        },
    },
    token: String,
}))