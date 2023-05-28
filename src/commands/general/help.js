const { ActionRowBuilder, CommandInteraction, StringSelectMenuBuilder, EmbedBuilder } = require('discord.js');
const commandInfo = require('../../utility/commandInfo');
const pagination = require('discord-pagination-advanced');
const emojis = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣"]

module.exports = {
    data: {
        name: "help",
        description: "Get some help ;D",
        options: [{
            name: "menu",
            description: "Get basic information of the bot and category/command list",
            type: 1
        }, {
            name: "commands",
            description: "Get information of all commands of a category",
            type: 1,
            options: [{
                name: "category",
                type: 3,
                required: true,
                description: "The category who's commands information you want",
                choices: [{
                    name: "Admin",
                    value: "admin"
                }, {
                    name: "Admin",
                    value: "general"
                }]
            }]
        }, {
            name: "command",
            description: "Get information of a command",
            type: 1,
            options: [{
                name: "command",
                type: 3,
                required: true,
                description: "The command who's commands information you want"
            }]
        }]
    },

    /**
     * 
     * @param {*} client 
     * @param {CommandInteraction} interaction 
     */
    run: async (client, interaction) => {
        const option = interaction.options.getSubcommand();

        if (option === "menu") {
            const row = new ActionRowBuilder(), options = client.categories.map((v, i) => {
                return {
                    label: `${v.replace(v.charAt(0), v.charAt(0).toUpperCase())}`,
                    value: v,
                    emoji: emojis[i]
                }
            });

            let colOneUsed = false;

            row.addComponents(
                new StringSelectMenuBuilder({
                    customId: "select",
                    placeholder: "Choose a category",
                    options
                })
            );

            const msg = await interaction.reply({
                fetchReply: true,
                components: [row],
                embeds: [
                    new EmbedBuilder({
                        title: `📚 ${client.user.username}'s Help  Menu`,
                        description: `The perfect bot for easily managing\n- Multiple type of buttons\n- Creating custom embeds`,
                    }).setColor("#f5a207")
                ]
            });

            // Select menu collector for category
            const col = msg.createMessageComponentCollector({
                filter: (i) => i.user.id === interaction.user.id,
                time: 10000,
            });

            // Select menu collector for category
            col.on('collect', async (i) => {
                let cat = i.values[0], index = 0;
                colOneUsed = true;

                const msg = await i.update({
                    embeds: [{
                        title: `${cat.replace(cat.charAt(0), cat.charAt(0).toUpperCase())}'s commands list`,
                        description:
                            client.commands.filter(v => v.category === cat).map((v) => `\`${++index}.\`**${v.data.name}**\n${v.data.description}`).join("\n\n")
                    }],
                    components: [
                        new ActionRowBuilder({
                            components: [
                                new StringSelectMenuBuilder({
                                    customId: "select",
                                    placeholder: "Choose a command",
                                    options: client.commands.filter(v => v.category === cat).map((c, i) => {
                                        let v = c.data.name

                                        return {
                                            label: v.replace(v.charAt(0), v.charAt(0).toUpperCase()),
                                            value: v,
                                            emoji: emojis[i]
                                        }
                                    })
                                })
                            ]
                        })
                    ],
                    fetchReply: true
                });

                const col2 = msg.createMessageComponentCollector({
                    filter: (i) => i.user.id === interaction.user.id,
                    time: 60000
                });

                col2.on('collect', async (i) => {
                    const command = client.commands.get(i.values[0]);

                    await i.update({
                        embeds: [commandInfo(command)],
                        components: []
                    });

                    col2.stop();
                });

                col2.on('end', (x,reason) => {
                 if(reason === "time")   msg.edit({
                        components: []
                    })
                })

                col.stop();
            });

            // Select menu collector for category end
            col.on('end', (reason) => {
                if (!colOneUsed) {
                    msg.edit({
                        components: []
                    })
                }
            })
        } else if (option === "commands") {
            const cat = interaction.options.getString("category")?.toLowerCase();
            const commands = client.commands.filter(v => v.category === cat);

            const embeds = commands.map(v => commandInfo(v));

            pagination(interaction, embeds);
        } else if (option === "command") {
            interaction.reply({
                embeds: [commandInfo(client.commands.get(interaction.options.getString("command")?.toLowerCase()))]
            })
        }
    }
}