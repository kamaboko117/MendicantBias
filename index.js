const dotenv = require('dotenv');
dotenv.config({ path: './.env' });
const token = process.env.TOKEN2;
const databaseToken = process.env.DATABASE2;
const { connect } = require('mongoose');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const { Match } = require('./schemas/match')

const client = new Client({ intents: GatewayIntentBits.Guilds });
client.commands = new Collection();
client.buttons = new Collection();
client.selectMenus = new Collection();
client.modals = new Collection();
client.commandArray = [];
client.color = 0x18e1ee;
client.invite = 'https://discord.com/api/oauth2/authorize?client_id=688035147559337994&permissions=137439215616&scope=bot';
client.invite2= 'https://discord.com/api/oauth2/authorize?client_id=1026870487885815870&permissions=347136&scope=bot'

const functionFolders = fs.readdirSync('./functions');
for (const folder of functionFolders) {
    const functionFiles = fs.readdirSync(`./functions/${folder}`).filter(file => file.endsWith('.js'));
    for (const file of functionFiles)
        require(`./functions/${folder}/${file}`)(client);
}

client.handleEvents();
client.handleCommands();
client.handleComponents();
client.login(token);
(async () => {
    await connect(databaseToken).catch(console.error);
    client.matchCount = await Match.estimatedDocumentCount();
})();