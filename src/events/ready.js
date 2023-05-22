const { ActivityType } = require("discord.js");

module.exports = async (client) => {
    console.log(`${client.user.tag} is online!`);

    client.user.setActivity({
        name: "all them buttons",
        type: ActivityType.Watching,
    })

    client.application.commands.set(client.commands.map(v => v.data));
}
