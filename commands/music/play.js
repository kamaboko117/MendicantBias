const dotenv = require("dotenv");
dotenv.config({ path: "../../.env" });
const {
    SlashCommandBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    ActionRowBuilder,
} = require("discord.js");
const ytdl = require("ytdl-core");
// const ytdl2 = require('play-dl');
const {
    joinVoiceChannel,
    getVoiceConnection,
    VoiceConnectionStatus,
    createAudioPlayer,
    createAudioResource,
    StreamType,
    AudioPlayerStatus,
    entersState,
} = require("@discordjs/voice");
const search = require("youtube-search");
const { Queue } = require("../../classes/Queue");
const YTopts = {
    maxResults: 5,
    key: process.env.GOOGLE,
    type: "video",
};
const youtubesearchapi = require("youtube-search-api");
const ytCookie = process.env.YTCOOKIE;

function isValidHttpUrl(string) {
    let url;
    try {
        url = new URL(string);
    } catch (_) {
        return false;
    }
    return url.protocol === "http:" || url.protocol === "https:";
}

function mendicantJoin(voice, guild, client) {
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
                queue: new Queue(),
            });
        }
        connection.on(VoiceConnectionStatus.Signalling, () => {
            console.log(`signalling...`);
        });
        connection.on(VoiceConnectionStatus.Ready, () => {
            console.log(`Ready`);
        });
        connection.on(
            VoiceConnectionStatus.Disconnected,
            async (oldState, newState) => {
                try {
                    await Promise.race([
                        entersState(
                            connection,
                            VoiceConnectionStatus.Signalling,
                            5_000
                        ),
                        entersState(
                            connection,
                            VoiceConnectionStatus.Connecting,
                            5_000
                        ),
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
                    while (!queue.isEmpty) queue.dequeue();
                    console.log(logMsg);
                }
            }
        );
    }
    
    return connection;
}

async function mendicantPlay(interaction, resource, client, silent) {
    if (interaction.inRawGuild) await interaction.guild.members.fetch();
    const { voice } = interaction.member;
    if (!voice.channelId) {
        interaction.reply("Error: You are not in a voice channel");
        return;
    }
    let connection = mendicantJoin(voice, interaction.guild, client);
    let queue = await client.queues.find(
        (queue) => queue.id === interaction.guild.id
    ).queue;
    if (queue.isEmpty) {
        console.log("creating new player");

        const player = createAudioPlayer();
        // An AudioPlayer will always emit an "error" event with a .resource property
        player.on("error", (error) => {
            console.error(
                "Error:",
                error.message,
                "with track",
                error.resource
            );
        });
        let dispatcher = connection.subscribe(player);
        queue.enqueue(resource);
        player.play(resource);
        player.on(AudioPlayerStatus.Idle, () => {
            if (!queue.isEmpty) {
                queue.dequeue();
                if (!queue.isEmpty) {
                    console.log("play new resource");
                    player.play(queue.peek());
                } else {
                    //30 min timer until a disconnection if still Idle

                    client.timeoutID = setTimeout(() => {
                        dispatcher.unsubscribe();
                        player.stop();
                        console.log("unsubscribed");
                        connection.disconnect();
                        console.log("connection disconnected");
                    }, 800_000);
                }
            } else {
                //30 min timer until a disconnection if still Idle
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
        queue.enqueue(resource);
    }

    if (silent)
        return ;
    await interaction.reply({
        content: `Queued **${resource.metadata.title}**`,
        ephemeral: false,
    });
}

async function mendicantCreateResource(interaction, videoID, details) {
    let videoDetails = details ? details : null;
    console.log(videoDetails)
    if (!details){
        await ytdl
            .getInfo(`https://www.youtube.com/watch?v=${videoID}`, {
                requestOptions: {
                    headers: {
                        Cookie: ytCookie,
                    },
                },
            })
            .catch((error) =>
                interaction.channel.send(`ytdl module error: ${error} [COULD NOT GET VIDEO DETAILS]`)
            )
            .then((value) => {
                videoDetails = value.videoDetails;
            });
        if (!videoDetails) return null;
    }

    let resourceTitle = videoDetails.title;
    console.log(videoDetails.title);
    let stream = ytdl(videoID, {
        filter: "audioonly",
        highWaterMark: 1 << 25,
    }).on("error", (err) =>
        interaction.channel.send(`ytdl module error: ${err}`)
    );
    let resource = createAudioResource(stream, {
        inputType: StreamType.Arbitrary,
        metadata: {
            title: resourceTitle,
        },
    });
    if (resource.playStream.readableEnded || resource.playStream.destroyed) {
        interaction.channel.send("Error: Could not create resource");
        return null;
    }

    return resource;
}

async function mendicantSearch(option1, interaction, client) {
    let results = await search(option1, YTopts);
    if (!results.results.length) {
        interaction.reply(`No results for "${option1}"`);
        return;
    }
    let i = 0;
    let titles = results.results.map((result) => {
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
    for (const result of results.results) {
        let customID = `P ${result.id} ${fields[i].value}`.substring(0, 99);
        buttons[i++] = new ButtonBuilder()
            .setCustomId(customID)
            .setStyle(ButtonStyle.Secondary)
            .setLabel(`${i}`);
        if (i === 5) break;
    }

    await interaction.reply({
        // content: "yo",
        ephemeral: false,
        embeds: [embed],
        components: [new ActionRowBuilder().addComponents(buttons)],
    });
}

function isPlaylist(url) {
    if (!isValidHttpUrl(url)) return false;
    return url.includes("&list=") || url.includes("?list=");
}

function getPlaylistId(url) {
    let keyword;
    if (url.includes("&list=")) keyword = "&list=";
    else if (url.includes("?list=")) keyword = "?list=";
    let index = url.indexOf(keyword);
    let end = url.indexOf("&", index + 1);
    console.log(`index: ${index}`);
    if (end === -1) return url.substring(index + keyword.length);
    else return url.substring(index + keyword.length, end);
}

function findVideoIndex(url, playlist) {
    let videoID;
    if (ytdl.validateURL(url)) {
        videoID = ytdl.getURLVideoID(url);
    } else {
        return 0;
    }
    let i = 0;
    for (const video of playlist.items) {
        if (videoID === video.id) return i + 1;
        i++;
    }
    return 0;
}

module.exports = {
    mendicantPlay: mendicantPlay,
    mendicantCreateResource: mendicantCreateResource,

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
            youtubesearchapi
                .GetPlaylistData(playlistID)
                .then(async (playlist) => {
                    let index = findVideoIndex(option1, playlist);
                    const button1 = new ButtonBuilder()
                        .setCustomId(`A ${playlistID} ${index}`)
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji("✅");
                    await interaction.channel.send({
                        content: `Add this playlist to the queue? (${
                            playlist.items.length - index
                        } videos)`,
                        components: [
                            new ActionRowBuilder().addComponents(button1),
                        ],
                    });
                })
                .catch(console.error);
        }
        if (ytdl.validateURL(option1)) {
            let ID = ytdl.getURLVideoID(option1);
            let resource = await mendicantCreateResource(interaction, ID);
            if (!resource) {
                interaction.reply("Error: Could not create resource");
                return;
            }

            await mendicantPlay(interaction, resource, client);
            return;
        }

        if (!playlistFlag) await mendicantSearch(option1, interaction, client);
        else interaction.reply("Playlist detected");
    },

    usage: "play a video from youtube. you can either use the video's URL or search for an input",
};
