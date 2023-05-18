const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = (type, labels, styles, ids) => {
    const rows = [];

    const max = Math.max(labels.length, styles.length, ids.length);
    let ind = 0;

    for (let i = 0; i < max; i++) {
        if ((rows[ind]?.components?.length || 0) >= 5) ind++;

        const button = new ButtonBuilder()
            .setLabel(labels[i])
            .setStyle(styles[i] || 1)

        if (type === "url") {
            button
                .setStyle(ButtonStyle.Link)
                .setURL(ids[i])
        } else {
            button.setCustomId(`${type}-${ids[i]}`);
        }

        rows[ind] ? rows[ind].addComponents(button) : rows[ind] = new ActionRowBuilder().addComponents(button);
    }

    return rows;
}
