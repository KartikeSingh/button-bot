const { EmbedBuilder } = require("discord.js")

module.exports = (command) => {
    return command?.data ? new EmbedBuilder()
    .setColor("Blue")
    .setTitle( `${command.data.name[0].toUpperCase() + command.data.name.slice(1)}'s Information 📑`) 
    .setDescription(`\`${command.data.description || "No Description"}\`\n\n${command.data.options?.length > 0 ? "Below is the list of options of this command" : ""}`)
    .addFields(command.data.options?.map(v => {
        return {
            name: v.type === 1 ? `/${command.data.name} ${v.name}` : v.name,
            value: `\`${v.description}\``
        }
    }))
    : new EmbedBuilder()
        .setTitle("❌ Invalid command was provided")
        .setColor("Red")
}