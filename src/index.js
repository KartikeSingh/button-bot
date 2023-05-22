// Load enviroment variables
require('dotenv').config();

// Imports
const { GatewayIntentBits, Partials } = require('discord.js');
const Client = require('./utility/Client');

// HTTP server setup
const app = (require('express'))();

app.get('/', (req, res) => res.sendStatus(200));

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
    if (message.author.id !== client.user.id || !message.components?.length) return;

    message.components.forEach(component => {
        component.components.forEach(async bt => {
            console.log(await button.findOneAndDelete({ id: bt.customId.split("-")[1] }));
        })
    });
});