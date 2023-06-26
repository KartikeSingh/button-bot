const { ActionRowBuilder, ButtonBuilder } = require("discord.js");

module.exports = (userId, closed = false, deleted = false) => [
    new ActionRowBuilder({
        components: [
            new ButtonBuilder({
                customId: `ticketClose-${userId}`,
                label: "Close",
                style: 4,
                emoji: "🔒",
                disabled: closed || deleted
            }),
            new ButtonBuilder({
                customId: `ticketOpen-${userId}`,
                label: "Open",
                style: 3,
                emoji: "🔓",
                disabled: !closed || deleted
            }),
            new ButtonBuilder({
                customId: `ticketDelete-${userId}`,
                label: "Delete",
                style: 4,
                emoji: "🗑️",
                disabled: deleted
            })
        ]
    })
]