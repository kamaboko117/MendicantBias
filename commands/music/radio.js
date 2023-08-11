import { SlashCommandBuilder } from "@discordjs/builders";
import {
  getVoiceConnection,
  createAudioPlayer,
  createAudioResource,
} from "@discordjs/voice";
import TuneIn from "node-tunein-radio";
import { mendicantJoin } from "./play.js";

const mendicantRadioSearch = async (option1, interaction, client) => {
  const radio = new TuneIn();
  radio.search(option1).then(async (result) => {
    const stations = result.body;
    const station = stations[0];
    const connection = getVoiceConnection(interaction.guildId);
    if (connection) {
      connection.destroy();
    }
    const { voice } = interaction.member;
    const connection2 = mendicantJoin(voice, interaction.guild, client);
    const stream = await radio
      .tune_radio(station.guide_id)
      .catch((err) => {
        console.log(err);
        // interaction.reply("Error: Could not play radio");
        return;
      })
      .then((stream) => {
        return stream.body[0];
      });

    const player = createAudioPlayer();
    connection2.subscribe(player);
    console.log(stream);
    const resource = createAudioResource(stream.url);
    player.play(resource);
    interaction.reply(`Now playing: ${station.text}`);
  });
};

export default {
  data: new SlashCommandBuilder()
    .setName("radio")
    .setDescription("Listen to a radio")
    .addStringOption((option) =>
      option
        .setName("radio-name")
        .setDescription("radio name")
        .setRequired(true)
    ),

  async execute(interaction, client) {
    const option1 = interaction.options.getString("radio-name");
    console.log(`${interaction.member.displayName} used /radio ${option1}`);
    const { voice } = interaction.member;
    if (!voice.channelId) {
      interaction.reply("Error: You are not in a voice channel");
      return;
    }

    await mendicantRadioSearch(option1, interaction, client);
  },

  usage: "",
};
