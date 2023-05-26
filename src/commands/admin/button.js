const { randomID } = require('create-random-id');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const buttonModel = require("../../models/button");
const createButtons = require("../../utility/createButtons");

module.exports = {
    data: {
        name: "button",
        description: "Create a button",
        options: [{
            name: "role",
            type: 1,
            description: "Create a button role",
            options: [{
                name: "labels",
                type: 3,
                description: "The labels for the buttons, separate them via | example: button one| second one|last one",
                required: true,
            }, {
                name: "styles",
                type: 3,
                description: "The styles for the buttons, separate them via | example: blue| red|grey",
                required: true,
            }, {
                name: "roles",
                type: 3,
                description: "The roles for the buttons, separate them via | example: @role| @role| @role",
                required: true,
            }]
        }, {
            name: "link",
            type: 1,
            description: "Create a button link",
            options: [{
                name: "labels",
                type: 3,
                description: "The labels for the buttons, separate them via | example: button one| second one|last one",
                required: true,
            }, {
                name: "urls",
                type: 3,
                description: "The urls for the buttons, separate them via | example: https://stuff | another one",
                required: true,
            }]
        }, {
            name: "reply",
            type: 1,
            description: "Create a button reply",
            options: [{
                name: "labels",
                type: 3,
                description: "The labels for the buttons, separate them via | example: button one| second one|last one",
                required: true,
            }, {
                name: "styles",
                type: 3,
                description: "The styles for the buttons, separate them via | example: blue| red|grey",
                required: true,
            }, {
                name: "replies",
                type: 3,
                description: "The replies for the buttons, separate them via | example: a | reply : Hi {mention}, name is {user}",
                required: true,
            }]
        }, {
            name: "custom",
            type: 1,
            description: "Create a button mix!",
            options: [{
                name: "labels",
                type: 3,
                description: "The labels for the buttons, separate them via | example: button one| second one|last one",
                required: true,
            }, {
                name: "styles",
                type: 3,
                description: "The styles for the buttons, separate them via | example: link| red| green",
                required: true,
            }, {
                name: "action",
                type: 3,
                description: "The action for the buttons, example:  https://x.co | role: @somerole | reply one : reply 2",
                required: true,
            }]
        }],
    },
    timeout: 100,

    run: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true });

        const option = interaction.options.getSubcommand();
        const action = interaction.options.getString("action")?.split("|")?.map(v => v.trim());
        const labels = interaction.options.getString("labels")?.split("|")?.map(v => v.trim());
        const styles = interaction.options.getString("styles")?.replace(/blue/gi, 1)?.replace(/grey/gi, 2)?.replace(/green/gi, 3)?.replace(/red/gi, 4)?.split("|").map(v => parseInt(v));
        const styles2 = interaction.options.getString("styles")?.replace(/blue/gi, 1)?.replace(/grey/gi, 2)?.replace(/green/gi, 3)?.replace(/red/gi, 4)?.replace(/link/gi, 5)?.split("|").map(v => parseInt(v));
        const roles = interaction.options.getString("roles")?.split("|")?.map(v => interaction.guild.roles.cache.get(v.match(/\d+/) + ""))?.filter(v => v);
        const urls = interaction.options.getString("urls")?.split("|")?.map(v => v.trim());
        const replies = interaction.options.getString("replies")?.split("|")?.map(v => v?.split(":"));

        if (option === "role") {
            const max = Math.max(labels.length, styles.length, roles.length);

            if (roles.length < max) return interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setColor("Red")
                        .setDescription(`Number of roles can't be less then labels or styles etc`)
                ]
            });

            interaction.channel.send({
                components: createButtons("role", labels, styles, roles.map(v => v.id))
            })
                .then(() => {
                    interaction.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setColor("Green")
                                .setTitle("✅ Buttons Sent")
                        ]
                    })
                })
                .catch((e) => {
                    interaction.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setColor("Red")
                                .setTitle("❌ Buttons Failed")
                                .setDescription(`\`\`\`${e.toString().substring(0, 4000)}\`\`\``)
                        ]
                    })
                })
        } else if (option === "link") {
            const max = Math.max(labels.length, urls.length);

            if (urls.length < max) return interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setColor("Red")
                        .setDescription(`Number of urls can't be less then labels or styles etc`)
                ]
            });

            interaction.channel.send({
                components: createButtons("url", labels, [], urls)
            })
                .then(() => {
                    interaction.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setColor("Green")
                                .setTitle("✅ Buttons Sent")
                        ]
                    })
                })
                .catch((e) => {
                    interaction.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setColor("Red")
                                .setTitle("❌ Buttons Failed")
                                .setDescription(`\`\`\`${e.toString().substring(0, 4000)}\`\`\``)
                        ]
                    })
                })
        } else if (option === "reply") {
            const max = Math.max(labels.length, styles.length, replies.length);

            if (replies.length < max) return interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setColor("Red")
                        .setDescription(`Number of replies can't be less then labels or styles etc`)
                ]
            });

            const buttons = [];

            for (let i = 0; i < max; i++) {
                buttons.push(await buttonModel.create({
                    guild: interaction.guildId,
                    id: randomID(12),
                    replies: replies[i]?.map(v => v?.trim())?.filter(v => v),
                    type: 0
                }))
            }

            interaction.channel.send({
                components: createButtons("reply", labels, styles, buttons.map(v => v.id))
            })
                .then(() => {
                    interaction.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setColor("Green")
                                .setTitle("✅ Buttons Sent")
                        ]
                    })
                })
                .catch((e) => {
                    interaction.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setColor("Red")
                                .setTitle("❌ Buttons Failed")
                                .setDescription(`\`\`\`${e.toString().substring(0, 4000)}\`\`\``)
                        ]
                    });

                    buttons.forEach(async b => b.delete())
                })
        } else if (option === "custom") {
            const max = Math.max(labels.length, styles2.length, action.length);

            if (action.length < max) return interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setColor("Red")
                        .setDescription(`Number of replies can't be less then labels or styles etc`)
                ]
            });

            const buttons = [];
            const rows = [];
            const errors = [];

            let ind = 0;

            for (let i = 0; i < max; i++) {
                let button;
                if (styles2[i] === 5) {
                    if (!action[i]?.startsWith("http")) {
                        errors.push(`Invalid URL [\`${i + 1}\` Button], Input: \`${action[i]}\``);
                        continue;
                    }

                    button = new ButtonBuilder()
                        .setLabel(labels[i] || `${i + 1}`)
                        .setStyle(5)
                        .setURL(action[i]);
                } else if (action[i]?.startsWith("role:")) {
                    const role = interaction.guild.roles.cache.get(action[i].match(/\d+/) + "");

                    if (!role) {
                        errors.push(`Invalid Role [\`${i + 1}\` Button], Input: \`${action[i]}\``);
                        continue;
                    }

                    button = new ButtonBuilder()
                        .setLabel(labels[i] || `${i + 1}`)
                        .setStyle(styles[i] || 1)
                        .setCustomId(`role-${role.id}`);
                } else {
                    const buttonData = await buttonModel.create({
                        guild: interaction.guildId,
                        id: randomID(12),
                        replies: action[i]?.split(":")?.map(v => v?.trim())?.filter(v => v),
                        type: 0
                    });

                    buttons.push(buttonData);

                    button = new ButtonBuilder()
                        .setLabel(labels[i] || `${i + 1}`)
                        .setStyle(styles[i] || 1)
                        .setCustomId(`reply-${buttonData.id}`);
                }

                if ((rows[ind]?.components?.length || 0) >= 5) ind++;

                rows[ind] ? rows[ind].addComponents(button) : rows[ind] = new ActionRowBuilder()
                    .addComponents(
                        button
                    )
            }

            if (errors.length) {
                buttons.forEach(async b => b.delete())

                return interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor("Red")
                            .setTitle("❌ Invalid Usage")
                            .setDescription(errors.join("\n"))
                    ]
                });
            }

            interaction.channel.send({
                components: rows
            })
                .then(() => {
                    interaction.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setColor("Green")
                                .setTitle("✅ Buttons Sent")
                        ]
                    })
                })
                .catch((e) => {
                    buttons.forEach(async b => b.delete());
                    interaction.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setColor("Red")
                                .setTitle("❌ Buttons Failed")
                                .setDescription(`\`\`\`${e.toString().substring(0, 4000)}\`\`\``)
                        ]
                    })
                })
        }
    }
}