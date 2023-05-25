// Load enviroment variables
require('dotenv').config();

// Imports
const { GatewayIntentBits, Partials, EmbedBuilder } = require('discord.js');
const Client = require('./utility/Client');

// HTTP server setup
const express = require('express');
const app = express();

app.use(express.json());

app.get('/', (req, res) => res.sendStatus(200));

app.get("/privacy_policy", (req, res) => res.sendFile(__dirname + "/pages/privacy_policy.html"))
app.get("/terms_of_service", (req, res) => res.sendFile(__dirname + "/pages/terms_of_service.html"))

app.post('/vote/e', async (req, res) => {
    const userId = req.body.user;
    const user = client.users.cache.get(userId);

    if (!userId) return;

    client.channels.cache.get("979710018385494016")?.send({
        embeds: [
            new EmbedBuilder()
                .setColor("DarkGreen")
                .setTitle("New Vote")
                .setDescription(`<@${userId}> (${user ? user.username : userId}) has voted for me on [top.gg](https://top.gg/bot/1108647987120447538/vote)`)
        ]
    });

    res.sendStatus(200);
})

app.listen(process.env.PORT || 3001);

// Database setup
const mongoose = require('mongoose');
const button = require('./models/button');

mongoose.connect(process.env.MONGO_URI).then(() => console.log("Database Connected")).catch(() => console.log("Database Connection Failed"))

// Discord Client Setup
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
    partials: [Partials.Message, Partials.User, Partials.Channel]
});

client.login(process.env.TOKEN);

client.on("messageDelete", message => {
    if (message.author?.id !== client.user.id || !message.components?.length) return;

    message.components.forEach(component => {
        component.components.forEach(async bt => {
            console.log(await button.findOneAndDelete({ id: bt.customId.split("-")[1] }));
        })
    });
});

process.on("uncaughtException", console.log);