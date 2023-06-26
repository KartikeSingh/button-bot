const { EmbedBuilder, CommandInteraction, ChannelType, OverwriteType, ActionRowBuilder, ButtonBuilder } = require("discord.js");
const button = require("../models/button");
const getTicketButtons = require("../utility/getTicketButtons");

/**
 * 
 * @param {*} client 
 * @param {CommandInteraction} interaction 
 * @returns 
 */
module.exports = async (client, interaction) => {
    if (!interaction.customId) return;

    const [type, id, id2] = interaction.customId.split("-");

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

        const reply = data.replies[Math.floor(Math.random() * data.replies.length)] || "something went wrong";

        interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor("Random")
                    .setDescription(reply.replace(/{user}/g, interaction.user.username).replace(/{mention}/, interaction.user.toString()).replace(/{server}/g, interaction.guild.name))
            ]
        });
    } else if (type === "ticket") {
        const format = id || "ticket_{name}",
            category = interaction.guild.channels.cache.get(id2);

        interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor("Yellow")
                    .setTitle("🟡| Creating Ticket")
            ],
            ephemeral: true
        });

        const ticket = await interaction.guild.channels.create({
            name: format.replace(/{name}/g, interaction.user.username),
            type: ChannelType.GuildText,
            parent: category?.type === ChannelType.GuildCategory ? category : null,
            permissionOverwrites: [{
                id: interaction.guild.roles.everyone.id,
                deny: ["ViewChannel"],
                type: OverwriteType.Role
            }, {
                id: interaction.user.id,
                allow: ["ViewChannel", "SendMessages", "AttachFiles", "EmbedLinks"],
                type: OverwriteType.User
            }]
        }).catch(console.log);

        if (!ticket) return interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor("Red")
                    .setTitle("❌ Ticket Creation Failed")
            ]
        });

        ticket.send({
            content: `${interaction.user}, ticket created successfully`,
            components: getTicketButtons(interaction.user.id, false, false)
        })

        interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor("Green")
                    .setTitle("✅ Ticket Created Successfully")
                    .setDescription(`${ticket}`)
            ]
        })

    } else if (type === "ticketClose") {
        interaction.update({
            components: getTicketButtons(interaction.user.id, true, false)
        });

        const user = await interaction.guild.members.fetch(id).catch(() => null);

        await interaction.channel.permissionOverwrites.edit(user.user, {
            ViewChannel: false
        }) || await interaction.channel.permissionOverwrites.create(user.user, {
            ViewChannel: false
        });

        interaction.channel.send({
            embeds: [
                new EmbedBuilder()
                    .setColor("Green")
                    .setTitle("✅ Ticket Closed")
                    .addFields({
                        name: "User",
                        value: user ? user.toString() : "Unknown",
                        inline: true
                    }, {
                        name: "Moderator",
                        value: interaction.user.toString(),
                        inline: true
                    })
            ]
        })
    } else if (type === "ticketOpen") {
        interaction.update({
            components: getTicketButtons(interaction.user.id, false, false)
        });

        const user = await interaction.guild.members.fetch(id).catch(() => null);

        await interaction.channel.permissionOverwrites.edit(user.user, {
            ViewChannel: true
        }) || await interaction.channel.permissionOverwrites.create(user.user, {
            ViewChannel: true
        });

        interaction.channel.send({
            embeds: [
                new EmbedBuilder()
                    .setColor("Green")
                    .setTitle("✅ Ticket Opened")
                    .addFields({
                        name: "User",
                        value: user ? user.toString() : "Unknown",
                        inline: true
                    }, {
                        name: "Moderator",
                        value: interaction.user.toString(),
                        inline: true
                    })
            ]
        })
    } else if (type === "ticketDelete") {
        interaction.update({
            components: getTicketButtons(interaction.user.id, true, true)
        });

        const user = await interaction.guild.members.fetch(id).catch(() => null);

        setTimeout(() => {
            interaction.channel?.delete()?.catch(() => null);
        }, 10000);

        interaction.channel.send({
            embeds: [
                new EmbedBuilder()
                    .setColor("Green")
                    .setTitle("✅ Ticket Deleted")
                    .setDescription("Channel will be deleted in 10 seconds")
                    .addFields({
                        name: "User",
                        value: user ? user.toString() : "Unknown",
                        inline: true
                    }, {
                        name: "Moderator",
                        value: interaction.user.toString(),
                        inline: true
                    })
            ]
        })
    }
}