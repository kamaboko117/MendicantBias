import type { VoiceConnection } from "@discordjs/voice";
import {
  AudioPlayerStatus,
  createAudioPlayer,
  createAudioResource,
  StreamType,
} from "@discordjs/voice";
import ytdl from "@distube/ytdl-core";
import dotenv from "dotenv";
import type { GuildButtonInteraction } from "../../../classes/GuildButtonInteraction";
import type { GuildCommandInteraction } from "../../../classes/GuildCommandInteraction";
import type { Mendicant } from "../../../classes/Mendicant";
import type VideoDetails from "../../../classes/VideoDetails";
import type { MusicQueue } from "../../../types/MusicQueue";
import { mendicantJoin } from "./mendicantJoin";
import { mendicantMove } from "./mendicantMove";
dotenv.config({ path: "./.env" });

const cookiesBase64 = process.env.YTCOOKIE || "";
const cookiesJson = Buffer.from(cookiesBase64, "base64").toString("utf-8");
const cookies = cookiesJson && JSON.parse(cookiesJson);

const clearMendicantTimeout = (
  interaction: GuildCommandInteraction | GuildButtonInteraction,
  mendicant: Mendicant
) => {
  const timeoutId = mendicant.timeoutIds.find(
    (timeout) => timeout.guildId === interaction.guildId
  );
  if (timeoutId) {
    clearTimeout(timeoutId.timeoutId);
    mendicant.timeoutIds = mendicant.timeoutIds.filter(
      (timeout) => timeout.guildId !== interaction.guildId
    );
  }
};

//creates a streamable resource
const mendicantCreateResource = (
  interaction: GuildCommandInteraction | GuildButtonInteraction,
  videoDetails: VideoDetails
) => {
  const agent = cookies ?? ytdl.createAgent(cookies);
  const stream = ytdl(videoDetails.id, {
    playerClients: ["WEB_EMBEDDED"],
    agent: agent,
    filter: "audioonly",
    highWaterMark: 1 << 25,
  }).on("error", (err) => {
    if (interaction.channel?.isSendable())
      interaction.channel?.send(`ytdl module error: ${err}`);
  });
  const resource = createAudioResource(stream, {
    inputType: StreamType.Arbitrary,
    metadata: {
      title: videoDetails.title,
      length: videoDetails.length,
      id: videoDetails.id,
    },
  });
  if (resource.playStream.readableEnded || resource.playStream.destroyed) {
    return null;
  }
  return resource;
};

type CreateNewPlayerOptions = {
  connection: VoiceConnection;
  queue: MusicQueue["items"] | undefined;
  item: VideoDetails;
  interaction: GuildCommandInteraction | GuildButtonInteraction;
  mendicant: Mendicant;
};
const createNewPlayer = ({
  connection,
  queue,
  item,
  interaction,
  mendicant,
}: CreateNewPlayerOptions) => {
  const player = createAudioPlayer();

  // An AudioPlayer will always emit an "error" event with a .resource property
  player.on("error", (error) => {
    console.error("Error:", error.message);
  });

  const dispatcher = connection.subscribe(player);
  queue?.push(item);

  const resource = mendicantCreateResource(interaction, item);
  if (!resource) {
    if (interaction.channel?.isSendable())
      interaction.channel?.send("Error: Could not create resource");
    return;
  }

  player.play(resource);

  player.on(AudioPlayerStatus.Idle, () => {
    if (queue?.length) {
      queue.shift();
    }

    if (queue?.length) {
      console.log(queue[0].title);
      const nextResource = mendicantCreateResource(interaction, queue[0]);
      if (!nextResource) {
        if (interaction.channel?.isSendable())
          interaction.channel?.send("Error: Could not create resource");
        return;
      }
      player.play(nextResource);
    } else {
      //30 min timer until a disconnection if still Idle
      mendicant.timeoutIds.push({
        guildId: interaction.guildId,
        timeoutId: setTimeout(() => {
          dispatcher?.unsubscribe();
          player.stop();
          console.log("unsubscribed");
          connection.disconnect();
          console.log("connection disconnected");
        }, 800_000),
      });
    }
  });

  player.on(AudioPlayerStatus.Playing, () => {
    clearMendicantTimeout(interaction, mendicant);
  });
};

export const mendicantPlay = async (
  interaction: GuildCommandInteraction | GuildButtonInteraction,
  item: VideoDetails,
  mendicant: Mendicant,
  silent: boolean,
  index: number
) => {
  const { voice } = interaction.member;
  if (!voice.channelId) {
    interaction.reply("Error: You are not in a voice channel");
    return;
  }

  const connection = mendicantJoin(voice, interaction.guild, mendicant);
  const queue = mendicant.queues.find(
    (queue) => queue.id === interaction.guild.id
  )?.items;

  if (!queue?.length) {
    console.log("creating new player");
    createNewPlayer({ connection, interaction, item, mendicant, queue });
  } else {
    queue.push(item);
    if (index) {
      mendicantMove(queue, queue.length - 1, index);
    }
  }

  if (!silent) {
    await interaction.reply({
      content: `Queued **${item.title}**`,
      ephemeral: false,
    });
  }
};
