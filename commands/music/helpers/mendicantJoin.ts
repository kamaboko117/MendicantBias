import {
  entersState,
  getVoiceConnection,
  joinVoiceChannel,
  VoiceConnectionStatus,
} from "@discordjs/voice";
import type { Guild, VoiceState } from "discord.js";
import type { Mendicant } from "../../../classes/Mendicant";

export const mendicantJoin = (
  voice: VoiceState,
  guild: Guild,
  mendicant: Mendicant
) => {
  const connection = getVoiceConnection(guild.id);

  if (connection) {
    return connection;
  }

  const newConnection = joinVoiceChannel({
    channelId: voice.channelId as string,
    guildId: guild.id,
    adapterCreator: guild.voiceAdapterCreator,
  });

  if (!mendicant.queues.find((queue) => queue.id === guild.id)) {
    mendicant.queues.push({
      id: guild.id,
      items: [],
    });
  }

  newConnection.on(VoiceConnectionStatus.Signalling, () => {
    console.log(`***Signalling...`);
  });

  newConnection.on(VoiceConnectionStatus.Ready, () => {
    console.log(`***Ready`);
  });

  newConnection.on(VoiceConnectionStatus.Disconnected, async () => {
    try {
      if (newConnection) {
        await Promise.race([
          entersState(newConnection, VoiceConnectionStatus.Signalling, 5_000),
          entersState(newConnection, VoiceConnectionStatus.Connecting, 5_000),
        ]);
        // Seems to be reconnecting to a new channel - ignore disconnect
      }
    } catch {
      // Seems to be a real disconnect which SHOULDN'T be recovered from
      let logMsg = `Connection destroyed`;
      try {
        newConnection?.destroy();
      } catch (error) {
        logMsg = `Could not destroy connection: ${error}`;
      }
      const queue = mendicant.queues.find(
        (queue) => queue.id === guild.id
      )?.items;
      if (queue) {
        queue.length = 0;
      }
      console.log(logMsg);
    }
  });

  return newConnection;
};
