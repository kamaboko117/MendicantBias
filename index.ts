import { GatewayIntentBits } from "discord.js";
import dotenv from "dotenv";
import { connect } from "mongoose";
import { Mendicant } from "./classes/Mendicant";
import Match from "./schemas/match";

dotenv.config({ path: "./.env" });

// check if env is dev or prod
const isDev = process.env.NODE_ENV === "development";

const token = isDev ? process.env.TOKEN2 : process.env.TOKEN;
const databaseToken = isDev ? process.env.DATABASE2 : process.env.DATABASE;

const mendicant = new Mendicant({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
  ],
});
// mendicant.invite =
//   "https://discord.com/api/oauth2/authorize?client_id=688035147559337994&permissions=137439215616&scope=bot";
// mendicant.invite2 =
//   "https://discord.com/api/oauth2/authorize?client_id=1026870487885815870&permissions=347136&scope=bot";

mendicant.handleEvents();
mendicant.handleComponents();
mendicant.login(token);
(async () => {
  await connect(databaseToken || "").catch(console.error);
  mendicant.matchCount = await Match.estimatedDocumentCount();
})();
mendicant.voteRoutine();
