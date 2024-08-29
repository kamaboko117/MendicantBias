import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import {
  SlashCommandBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ActionRowBuilder,
  Guild,
  VoiceState,
} from "discord.js";
import ytdl from "@distube/ytdl-core";
import {
  joinVoiceChannel,
  getVoiceConnection,
  VoiceConnectionStatus,
  createAudioPlayer,
  createAudioResource,
  StreamType,
  AudioPlayerStatus,
  entersState,
  VoiceConnection,
} from "@discordjs/voice";
import * as youtubei from "youtubei";
import youtubesearchapi from "youtube-search-api";
import { mendicantMove } from "./move";
import { Mendicant } from "../../classes/Mendicant.js";
import GuildCommandInteraction from "../../classes/GuildCommandInteraction.js";
import VideoDetails from "../../classes/VideoDetails";
import { APIEmbedField } from "discord-api-types/v9";
import GuildButtonInteraction from "../../classes/GuildButtonInteraction.js";

const cookiesBase64 = process.env.YTCOOKIE || "";
const cookiesJson = Buffer.from(cookiesBase64, "base64").toString("utf-8");
const cookies = JSON.parse(cookiesJson);

function isValidHttpUrl(string: string) {
  let url;
  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }
  return url.protocol === "http:" || url.protocol === "https:";
}

export function mendicantJoin(
  voice: VoiceState,
  guild: Guild,
  mendicant: Mendicant
) {
  let connection: VoiceConnection | undefined = getVoiceConnection(guild.id);

  if (connection) {
    return connection;
  }

  connection = joinVoiceChannel({
    channelId: voice.channelId as string,
    guildId: guild.id,
    adapterCreator: guild.voiceAdapterCreator,
  });

  if (!mendicant.queues.find((queue) => queue.id === guild.id)) {
    mendicant.queues.push({
      id: guild.id,
      queue: [],
    });
  }

  connection.on(VoiceConnectionStatus.Signalling, () => {
    console.log(`***Signalling...`);
  });

  connection.on(VoiceConnectionStatus.Ready, () => {
    console.log(`***Ready`);
  });

  connection.on(
    VoiceConnectionStatus.Disconnected,
    async (oldState, newState) => {
      try {
        if (connection) {
          await Promise.race([
            entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
            entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
          ]);
          // Seems to be reconnecting to a new channel - ignore disconnect
        }
      } catch (error) {
        // Seems to be a real disconnect which SHOULDN'T be recovered from
        let logMsg = `Connection destroyed`;
        try {
          connection?.destroy();
        } catch (error) {
          logMsg = `Could not destroy connection: ${error}`;
        }
        const queue = mendicant.queues.find(
          (queue) => queue.id === guild.id
        ).queue;
        queue.length = 0;
        console.log(logMsg);
      }
    }
  );

  return connection;
}

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

export async function mendicantPlay(
  interaction: GuildCommandInteraction | GuildButtonInteraction,
  item: VideoDetails,
  mendicant: Mendicant,
  silent: boolean,
  index: number
) {
  const { voice } = interaction.member;
  if (!voice.channelId) {
    interaction.reply("Error: You are not in a voice channel");
    return;
  }

  const connection = mendicantJoin(voice, interaction.guild, mendicant);
  const queue = mendicant.queues.find(
    (queue) => queue.id === interaction.guild.id
  )?.queue;

  if (!queue?.length) {
    console.log("creating new player");

    const player = createAudioPlayer();
    // An AudioPlayer will always emit an "error" event with a .resource property
    player.on("error", (error) => {
      console.error("Error:", error.message, "with track", error.resource);
    });

    const dispatcher = connection.subscribe(player);
    queue?.push(item);

    const resource = mendicantCreateResource(interaction, item);
    if (!resource) {
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
}

//creates a streamable resource
function mendicantCreateResource(
  interaction: GuildCommandInteraction | GuildButtonInteraction,
  videoDetails: VideoDetails
) {
  const agent = ytdl.createAgent(cookies);
  let stream = ytdl(videoDetails.id, {
    agent: agent,
    filter: "audioonly",
    highWaterMark: 1 << 25,
  }).on("error", (err) =>
    interaction.channel?.send(`ytdl module error: ${err}`)
  );
  let resource = createAudioResource(stream, {
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
}

//creates a queue item without downloading the resource stream
export async function mendicantCreateItem(
  videoID: string,
  details: VideoDetails | null,
  module = "ytdl"
) {
  if (!details) {
    if (module === "youtubei") {
      const youtube = new youtubei.Client();
      console.log(`getting video details for ${videoID}`);
      try {
        const videoDetailsRaw = await youtube.getVideo(videoID);
        console.log(`got video details for ${videoID}`);
        details = new VideoDetails(
          videoID,
          videoDetailsRaw?.title ?? "",
          videoDetailsRaw instanceof youtubei.Video
            ? videoDetailsRaw.duration
            : 0
        );
      } catch (err) {
        console.log(err);
        return null;
      }
    } else {
      // default to using ytdl-core to get video details
      try {
        const agent = ytdl.createAgent(cookies);
        const videoInfo = await ytdl.getBasicInfo(videoID, { agent: agent });
        details = new VideoDetails(
          videoID,
          videoInfo.videoDetails.title,
          parseInt(videoInfo.videoDetails.lengthSeconds)
        );
      } catch (err) {
        console.log(err);
        return null;
      }
    }
  }

  console.log(details?.title);

  return details;
}

export async function mendicantSearch(
  option1: string,
  interaction: GuildCommandInteraction,
  mendicant: Mendicant,
  index: number
) {
  const options = [{ type: "video" }];
  const results = await youtubesearchapi.GetListByKeyword(
    option1,
    false,
    5,
    options
  );

  if (!results.items.length) {
    interaction.reply(`No results for "${option1}"`);
    return;
  }

  const titles: string[] = results.items.map(
    (result: { title: any }, i: number) => `**${i + 1}:** ${result.title}`
  );

  const fields: APIEmbedField[] = titles.map((title) => ({
    name: "\u200B",
    value: title,
  }));

  const embed = new EmbedBuilder()
    .setDescription(`results for **${option1}**: select a track`)
    .setColor(mendicant.color)
    .addFields(fields);

  const buttons = results.items.slice(0, 5).map((result: any, i: number) => {
    const customID = `P ${result.id} ${index ? index : "0"}`.substring(0, 99);
    return new ButtonBuilder()
      .setCustomId(customID)
      .setStyle(ButtonStyle.Secondary)
      .setLabel(`${i + 1}`);
  });

  await interaction.reply({
    ephemeral: false,
    embeds: [embed],
    components: [new ActionRowBuilder<ButtonBuilder>().addComponents(buttons)],
  });
}

function isPlaylist(url: string) {
  return (
    isValidHttpUrl(url) && (url.includes("&list=") || url.includes("?list="))
  );
}

function getPlaylistId(url: string) {
  const keyword = url.includes("&list=") ? "&list=" : "?list=";
  const index = url.indexOf(keyword);
  const end = url.indexOf("&", index + 1);
  console.log(`index: ${index}`);
  return end === -1
    ? url.substring(index + keyword.length)
    : url.substring(index + keyword.length, end);
}

function findVideoIndex(url: string): number {
  if (!ytdl.validateURL(url)) {
    return 0;
  }

  const indexParam = "&index=";
  const indexStart = url.indexOf(indexParam) + indexParam.length;
  const index = parseInt(url.slice(indexStart));
  return isNaN(index) ? 0 : index;
}

export default {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("plays a video from youtube in voice chat")
    .addStringOption((option) =>
      option
        .setName("url-or-search")
        .setDescription("youtube video link or search")
        .setRequired(true)
    ),
  async execute(interaction: GuildCommandInteraction, mendicant: Mendicant) {
    const option1 = interaction.options.getString("url-or-search")!;
    console.log(`${interaction.member.displayName} used /play ${option1}`);
    let playlistFlag = isPlaylist(option1);
    if (playlistFlag) {
      let playlistID = getPlaylistId(option1);
      console.log("playlist");
      console.log(`URL: ${option1} ID: ${playlistID}`);

      const youtube = new youtubei.Client();
      youtube.getPlaylist(playlistID).then(async (playlist) => {
        if (!playlist) {
          interaction.channel?.send(
            "Could not get playlist, make sure it is public"
          );
          return;
        }
        let index = findVideoIndex(option1);
        const button1 = new ButtonBuilder()
          .setCustomId(`A ${playlistID} ${index}`)
          .setStyle(ButtonStyle.Secondary)
          .setEmoji("✅");
        const button2 = new ButtonBuilder()
          .setCustomId(`S ${playlistID} ${index}`)
          .setStyle(ButtonStyle.Secondary)
          .setEmoji("🔀");
        await interaction.channel?.send({
          content: `Add this playlist to the queue? (${
            playlist.videoCount - index
          } videos)`,
          components: [
            new ActionRowBuilder<ButtonBuilder>()
              .addComponents(button1)
              .addComponents(button2),
          ],
        });
      });
    }
    if (ytdl.validateURL(option1)) {
      let ID = ytdl.getURLVideoID(option1);
      let item = await mendicantCreateItem(ID, null);
      if (!item) {
        interaction.reply("Error: Could not create item");
        return;
      }

      await mendicantPlay(interaction, item, mendicant, false, 0);
      return;
    }

    if (!playlistFlag) {
      await mendicantSearch(option1, interaction, mendicant, 0);
    } else interaction.reply("Playlist detected");
  },

  usage:
    "play a video from youtube. you can either use the video's URL or search for an input",
};
