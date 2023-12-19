import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
const token = process.env.TOKEN;
const databaseToken = process.env.DATABASE;
import { connect } from "mongoose";
import { GatewayIntentBits } from "discord.js";
import Match from "./schemas/match";
import { Mendicant } from "./classes/Mendicant";
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
