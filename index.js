import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
const token = process.env.TOKEN2;
const databaseToken = process.env.DATABASE2;
import { connect } from "mongoose";
import { Client, Collection, GatewayIntentBits } from "discord.js";
import functions from "./functions/index.js";
import Match from "./schemas/match.js";
import { Queue } from "./classes/Queue.js";
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
  ],
});
client.commands = new Collection();
client.buttons = new Collection();
client.selectMenus = new Collection();
client.modals = new Collection();
client.commandArray = [];
client.color = 0x18e1ee;
client.invite =
  "https://discord.com/api/oauth2/authorize?client_id=688035147559337994&permissions=137439215616&scope=bot";
client.invite2 =
  "https://discord.com/api/oauth2/authorize?client_id=1026870487885815870&permissions=347136&scope=bot";
client.queues = [];
client.timeoutId = [];
client.voteQueue = new Queue();

Object.keys(functions).forEach((key) => {
  functions[key](client);
})
client.handleEvents();
client.handleComponents();
client.login(token);
(async () => {
  await connect(databaseToken).catch(console.error);
  client.matchCount = await Match.estimatedDocumentCount();
})();
client.voteRoutine();
