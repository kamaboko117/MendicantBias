import { SlashCommandBuilder } from "@discordjs/builders";
import {
  AudioPlayerStatus,
  createAudioPlayer,
  createAudioResource,
} from "@discordjs/voice";
import { InteractionContextType } from "discord.js";
import TuneIn from "node-tunein-api";
import GuildCommandInteraction from "../../classes/GuildCommandInteraction.js";
import { Mendicant } from "../../classes/Mendicant.js";
import { mendicantJoin } from "./play";

const mendicantRadioSearch = async (
  option1: string,
  interaction: GuildCommandInteraction,
  mendicant: Mendicant
) => {
  const gotModule = await import("got");
  const got = gotModule.default || gotModule;
  const radio = new TuneIn();
  const result = await radio.search(option1);
  const stations = result.stations;
  const station = stations[0];
  const { voice } = interaction.member;
  const connection = mendicantJoin(voice, interaction.guild, mendicant);
  const stationObject = await station.getRadioURL();
  const streamURL = stationObject.body[0].url;
  const readableStream = got.stream(streamURL);
  const player = createAudioPlayer();
  player.on(AudioPlayerStatus.AutoPaused, () => {
    console.log("AutoPaused");
  });
  player.on(AudioPlayerStatus.Buffering, () => {
    console.log("Buffering");
  });
  player.on(AudioPlayerStatus.Idle, () => {
    console.log("Idle");
  });
  player.on(AudioPlayerStatus.Paused, () => {
    console.log("Pause");
  });
  player.on(AudioPlayerStatus.Playing, () => {
    console.log("Playing");
  });
  player.on("error", (error) => {
    console.error(`Error: ${error.message}`);
  });
  connection.subscribe(player);
  const resource = createAudioResource(readableStream);
  player.play(resource);
  interaction.reply(`Now playing: ${station.title}`);
};

const radioCommand = {
  data: new SlashCommandBuilder()
    .setName("radio")
    .setDescription("Listen to a radio")
    .addStringOption((option) =>
      option
        .setName("radio-name")
        .setDescription("radio name")
        .setRequired(true)
    )
    .setContexts([InteractionContextType.Guild]),

  async execute(interaction: GuildCommandInteraction, mendicant: Mendicant) {
    const option1 = interaction.options.getString("radio-name")!;
    console.log(`${interaction.user.username} used /radio ${option1}`);
    const { voice } = interaction.member;
    if (!voice.channelId) {
      interaction.reply("Error: You are not in a voice channel");
      return;
    }

    await mendicantRadioSearch(option1, interaction, mendicant);
  },

  usage: "",
};

export default radioCommand;
