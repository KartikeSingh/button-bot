const { EmbedBuilder } = require("discord.js");
const button = require("../models/button");

module.exports = async (client, interaction) => {
    if (!interaction.customId) return;

    const [type, id] = interaction.customId.split("-");

    if (type === "role") {
        await interaction.deferReply({ ephemeral: true });

        const role = interaction.guild.roles.cache.get(id);

        if (!role) return interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor("Red")
                    .setTitle("❌ Role Not Found")
            ]
        });

        if (interaction.member.roles.cache.has(role.id)) {
            await interaction.member.roles.remove(role);

            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`✅ Removed ${role.name}`)
                        .setColor("Green")
                ],
                ephemeral: true
            });
        } else {
            await interaction.member.roles.add(role);
            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`✅ Added ${role.name}`)
                        .setColor("Green")
                ], ephemeral: true
            });
        }

    } else if (type === "reply") {
        await interaction.deferReply({ ephemeral: true });

        const data = await button.findOne({ id });

        if (!data) return interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor("Red")
                    .setTitle("⛔ This button does not exist")
            ]
        });

        const reply = data.replies[Math.floor(Math.random() * data.replies.length)]|| "something went wrong";

        interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor("Random")
                    .setDescription(reply.replace(/{user}/g, interaction.user.username).replace(/{mention}/, interaction.user.toString()).replace(/{server}/g, interaction.guild.name)) 
            ]
        });
    }
}
