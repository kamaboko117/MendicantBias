import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
const ytCookie = process.env.YTCOOKIE;
import {
  SlashCommandBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ActionRowBuilder,
} from "discord.js";
import ytdl from "ytdl-core";
import {
  joinVoiceChannel,
  getVoiceConnection,
  VoiceConnectionStatus,
  createAudioPlayer,
  createAudioResource,
  StreamType,
  AudioPlayerStatus,
  entersState,
} from "@discordjs/voice";
// import search from "youtube-search";
import youtubei from "youtubei";
import youtubesearchapi from "youtube-search-api";
import { mendicantMove } from "./move.js";
// const YTopts = {
//   maxResults: 5,
//   key: process.env.GOOGLE,
//   type: "video",
// };

function isValidHttpUrl(string) {
  let url;
  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }
  return url.protocol === "http:" || url.protocol === "https:";
}

export function mendicantJoin(voice, guild, client) {
  let connection;

  if (!(connection = getVoiceConnection(guild.id))) {
    connection = joinVoiceChannel({
      channelId: voice.channel.id,
      guildId: guild.id,
      adapterCreator: guild.voiceAdapterCreator,
    });
    if (!client.queues.find((queue) => queue.id === guild.id)) {
      client.queues.push({
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
          await Promise.race([
            entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
            entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
          ]);
          // Seems to be reconnecting to a new channel - ignore disconnect
        } catch (error) {
          // Seems to be a real disconnect which SHOULDN'T be recovered from
          let logMsg = `Connection destroyed`;
          try {
            connection.destroy();
          } catch (error) {
            logMsg = `Could not destroy connection: ${error}`;
          }
          let queue = client.queues.find(
            (queue) => queue.id === guild.id
          ).queue;
          queue.length = 0;
          console.log(logMsg);
        }
      }
    );
  }

  return connection;
}

export async function mendicantPlay(interaction, item, client, silent, index) {
  const { voice } = interaction.member;
  if (!voice.channelId) {
    interaction.reply("Error: You are not in a voice channel");
    return;
  }
  let connection = mendicantJoin(voice, interaction.guild, client);
  let queue = client.queues.find(
    (queue) => queue.id === interaction.guild.id
  ).queue;
  if (!queue.length) {
    console.log("creating new player");

    const player = createAudioPlayer();
    // An AudioPlayer will always emit an "error" event with a .resource property
    player.on("error", (error) => {
      console.error("Error:", error.message, "with track", error.resource);
    });
    let dispatcher = connection.subscribe(player);
    queue.push(item);
    player.play(mendicantCreateResource(interaction, item));
    player.on(AudioPlayerStatus.Idle, () => {
      if (queue.length) {
        queue.shift();
      }
      if (queue.length) {
        console.log(queue[0].title);
        player.play(mendicantCreateResource(interaction, queue[0]));
      } else {
        //30 min timer until a disconnection if still Idle
        //btw this is trash. this is a global timer, not a per-guild timer
        //i should probably fix this
        client.timeoutID = setTimeout(() => {
          dispatcher.unsubscribe();
          player.stop();
          console.log("unsubscribed");
          connection.disconnect();
          console.log("connection disconnected");
        }, 800_000);
      }
    });
    player.on(AudioPlayerStatus.Playing, () => {
      clearTimeout(client.timeoutID);
    });
  } else {
    queue.push(item);
    if (index) {
      mendicantMove(queue, queue.length - 1, index);
    }
  }

  if (silent) {
    return;
  }
  await interaction.reply({
    content: `Queued **${item.title}**`,
    ephemeral: false,
  });
}

//creates a streamable resource
function mendicantCreateResource(interaction, videoDetails) {
  let stream = ytdl(videoDetails.id, {
    filter: "audioonly",
    highWaterMark: 1 << 25,
  }).on("error", (err) =>
    interaction.channel.send(`ytdl module error: ${err}`)
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
    interaction.channel.send("Error: Could not create resource (1)");
    return null;
  }
  return resource;
}

//creates a queue item without downloading the resource stream
export async function mendicantCreateItem(interaction, videoID, details) {
  let videoDetails = details ? details : null;
  if (!details) {
    videoDetails = new Object();
    //with youtubei
    const youtube = new youtubei.Client();
    let videoDetailsRaw = await youtube.getVideo(videoID);

    videoDetails = {
      title: videoDetailsRaw.title,
      length: videoDetailsRaw.duration,
      id: videoID,
    };

    //with ytdl
    // await ytdl
    //   .getInfo(`https://www.youtube.com/watch?v=${videoID}`/*, {
    //     requestOptions: {
    //       headers: {
    //         Cookie: ytCookie,
    //       },
    //     },
    //   }*/)
    //   .catch((error) =>
    //     interaction.channel.send(
    //       `ytdl module error: ${error} [COULD NOT GET VIDEO DETAILS]`
    //     )
    //   )
    //   .then((value) => {
    //     videoDetailsRaw = value.videoDetails;
    //   });
    // if (!videoDetailsRaw) {
    //   return null;
    // }

    // videoDetails.title = videoDetailsRaw.title;
    // videoDetails.length = videoDetailsRaw.lengthSeconds;
    // videoDetails.id = videoID;
  }

  console.log(videoDetails.title);

  return videoDetails;
}

export async function mendicantSearch(option1, interaction, client, index) {
  // let results = await search(option1, YTopts).results;
  const options = [{ type: "video" }];
  let results = (
    await youtubesearchapi.GetListByKeyword(option1, false, 5, options)
  ).items;
  if (!results.length) {
    interaction.reply(`No results for "${option1}"`);
    return;
  }
  let i = 0;
  let titles = results.map((result) => {
    i++;
    return `**${i}:** ${result.title}`;
  });

  //create embed
  let fields = [];
  i = 0;
  for (const title of titles) {
    fields[i] = new Object();
    fields[i].name = "\u200B";
    fields[i++].value = title;
  }
  const embed = new EmbedBuilder()
    .setDescription(`results for **${option1}**: select a track`)
    .setColor(client.color)
    .addFields(fields);
  i = 0;
  let buttons = [];
  for (const result of results) {
    let customID = `P ${result.id} ${index ? index : "0"}`.substring(0, 99);
    buttons[i++] = new ButtonBuilder()
      .setCustomId(customID)
      .setStyle(ButtonStyle.Secondary)
      .setLabel(`${i}`);
    if (i === 5) {
      break;
    }
  }

  await interaction.reply({
    // content: "yo",
    ephemeral: false,
    embeds: [embed],
    components: [new ActionRowBuilder().addComponents(buttons)],
  });
}

function isPlaylist(url) {
  if (!isValidHttpUrl(url)) {
    return false;
  }
  return url.includes("&list=") || url.includes("?list=");
}

function getPlaylistId(url) {
  let keyword;
  if (url.includes("&list=")) {
    keyword = "&list=";
  } else if (url.includes("?list=")) {
    keyword = "?list=";
  }
  const index = url.indexOf(keyword);
  const end = url.indexOf("&", index + 1);
  console.log(`index: ${index}`);
  if (end === -1) {
    return url.substring(index + keyword.length);
  } else {
    return url.substring(index + keyword.length, end);
  }
}

function findVideoIndex(url /*, playlist*/) {
  if (!ytdl.validateURL(url)) {
    return 0;
  }
  // const videoID = ytdl.getURLVideoID(url);
  // let i = 0;
  // for (const video of playlist.items) {
  //   if (videoID === video.id) {
  //     return i + 1;
  //   }
  //   i++;
  // }

  //youtube playlist url can be used to find the index of a video in the playlist
  let index = url.substr(url.indexOf("&index=") + 7);
  return parseInt(index);
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
  async execute(interaction, client) {
    const option1 = interaction.options.getString("url-or-search");
    console.log(`${interaction.member.displayName} used /play ${option1}`);
    let playlistFlag = isPlaylist(option1);
    if (playlistFlag) {
      let playlistID = getPlaylistId(option1);
      console.log("playlist");
      console.log(`URL: ${option1} ID: ${playlistID}`);
      //with youtubesearchapi
      // youtubesearchapi
      //   .GetPlaylistData(playlistID, 1000)
      //   .then(async (playlist) => {
      //     let index = findVideoIndex(option1, playlist);
      //     const button1 = new ButtonBuilder()
      //       .setCustomId(`A ${playlistID} ${index}`)
      //       .setStyle(ButtonStyle.Secondary)
      //       .setEmoji("✅");
      //     await interaction.channel.send({
      //       content: `Add this playlist to the queue? (${
      //         playlist.items.length - index
      //       } videos)`,
      //       components: [new ActionRowBuilder().addComponents(button1)],
      //     });
      //   })
      //   .catch(console.error);

      //with youtubei
      const youtube = new youtubei.Client();
      youtube.getPlaylist(playlistID).then(async (playlist) => {
        if (!playlist) {
          interaction.channel.send(
            "Could not get playlist, make sure it is public"
          );
          return;
        }
        let index = findVideoIndex(option1, playlist);
        const button1 = new ButtonBuilder()
          .setCustomId(`A ${playlistID} ${index}`)
          .setStyle(ButtonStyle.Secondary)
          .setEmoji("✅");
        await interaction.channel.send({
          content: `Add this playlist to the queue? (${
            playlist.videoCount - index
          } videos)`,
          components: [new ActionRowBuilder().addComponents(button1)],
        });
      });
    }
    if (ytdl.validateURL(option1)) {
      let ID = ytdl.getURLVideoID(option1);
      let item = await mendicantCreateItem(interaction, ID);
      if (!item) {
        interaction.reply("Error: Could not create item");
        return;
      }

      await mendicantPlay(interaction, item, client);
      return;
    }

    if (!playlistFlag) {
      await mendicantSearch(option1, interaction, client);
    } else interaction.reply("Playlist detected");
  },

  usage:
    "play a video from youtube. you can either use the video's URL or search for an input",
};
