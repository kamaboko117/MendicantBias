const dotenv = require('dotenv');
dotenv.config({ path: '../../.env' });
const {
    SlashCommandBuilder,
    VoiceChannel,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    ActionRowBuilder
} = require('discord.js');
const ytdl = require('ytdl-core');
// const ytdl2 = require('play-dl');
const {
    joinVoiceChannel,
    getVoiceConnection,
    VoiceConnectionStatus,
    createAudioPlayer,
    createAudioResource,
    StreamType,
    AudioPlayerStatus
} = require("@discordjs/voice");
const search = require('youtube-search');
const { Queue } = require('../../classes/Queue');
const opts = {
    maxResults: 5,
    key: process.env.GOOGLE,
    type: 'video'
}
const ytCookie = process.env.YTCOOKIE;

function    mendicantJoin(voice, guild, client){
    let connection;
    
    if (!(connection = getVoiceConnection(guild.id))){
        connection = joinVoiceChannel({
            channelId: voice.channel.id,
            guildId: guild.id,
            adapterCreator: guild.voiceAdapterCreator
        });
        if (!(client.queues.find(queue => queue.id === guild.id))){
            client.queues.push({
                id: guild.id,
                queue: new Queue()
            })
        }
    }
    connection.on(VoiceConnectionStatus.Signalling, () => {
        console.log(`signalling...`);
    })
    connection.on(VoiceConnectionStatus.Ready, () => {
        console.log(`Ready`);
    })
    connection.on(VoiceConnectionStatus.Disconnected, () => {
        connection.destroy()
        let queue = client.queues.find(queue => queue.id === guild.id).queue
        while(!queue.isEmpty)
            queue.dequeue();
        console.log(`Connection destroyed`);
    })
    return connection;
}

async function    mendicantPlay(interaction, resource, client, resourceTitle){
    if (interaction.inRawGuild)
        await interaction.guild.members.fetch();
    const { voice } = interaction.member;
    if (!voice.channelId){
        interaction.reply("Error: You are not in a voice channel");
        return ;
    }
    let connection = mendicantJoin(voice, interaction.guild, client);
    let queue = await client.queues.find(queue => queue.id === interaction.guild.id).queue
    if (queue.isEmpty){
        console.log("creating new player")

        const player = createAudioPlayer();
        // An AudioPlayer will always emit an "error" event with a .resource property
        player.on('error', error => {
            console.error('Error:', error.message, 'with track', error.resource);
        });
        let dispatcher = connection.subscribe(player);
        queue.enqueue(resource)
        player.play(resource);
        player.on(AudioPlayerStatus.Idle, () => {
            if (!queue.isEmpty){
                queue.dequeue()
                if (!queue.isEmpty){
                    console.log("play new resource")
                    player.play(queue.peek());
                } else {
                    dispatcher.unsubscribe(),
                    player.stop();
                    console.log("unsubscribed");
                    connection.destroy();
                    console.log("connection destroyed");
                }
            } else {
                dispatcher.unsubscribe(),
                player.stop();
                console.log("unsubscribed");
                connection.destroy();
                console.log("connection destroyed");
            }
        })
    } else {
        queue.enqueue(resource);
    }
    
    await interaction.reply({
        content: `Queued **${resource.metadata.title}**`,
        ephemeral: false,
    })
}

async function mendicantCreateResource(interaction, url){
    let resourceTitle = null;
    await ytdl.getInfo(`https://www.youtube.com/watch?v=${url}`, {
        requestOptions: {
            headers: {
                Cookie: ytCookie,
                }
            }
        }).catch((error) => interaction.channel.send(`ytdl module error: ${error}`)).then(value => {
        resourceTitle = value.videoDetails;
    })
    if (!resourceTitle)
        return null;
    
    resourceTitle = resourceTitle.title;
    console.log(resourceTitle)
    let stream = ytdl(url, {
        filter: 'audioonly',
        highWaterMark: 1 << 25,
    }).on('error', (err) =>
        interaction.channel.send(`ytdl module error: ${err}`))
    let resource = createAudioResource(stream, {
            inputType: StreamType.Arbitrary,
            metadata: {
                title: resourceTitle,
            },
        });
    if (resource.playStream.readableEnded || resource.playStream.destroyed){
        interaction.channel.send('Error: Could not create resource');
        return null;
    }
    // let title = null;
    // await ytdl2.video_basic_info(url).then(value => {
    //     title = value.video_details.title;
    //     console.log(title)
    // }).catch(console.error)
    // if (!title)
    //     return null;
    // let stream = await ytdl2.stream(url);
    // let resource = createAudioResource(stream.stream, {
    //     inputType: stream.type,
    //     metadata: {
    //         title: title
    //     }
    // })

    return (resource);
}

module.exports = {
    mendicantPlay: mendicantPlay,
    mendicantCreateResource: mendicantCreateResource,

    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('plays a video from youtube in voice chat')
        .addStringOption(option =>
            option.setName('url-or-search')
                .setDescription('youtube video link or search')
                .setRequired(true)
            ),
    async execute(interaction, client) {
        const option1 = interaction.options.getString('url-or-search');
    
        if (ytdl.validateURL(option1)){
            let ID = ytdl.getURLVideoID(option1)
            let resource = await mendicantCreateResource(interaction, ID)
            if (!resource){
                interaction.reply('Error: Could not create resource')
                return ;
            }
            
            await mendicantPlay(interaction, resource, client);
            return ;
        }
        let results = (await search(option1, opts));
        if (!results.results.length){
            interaction.reply(`No results for "${option1}"`);
            return ;
        }
        let i = 0;
        let titles = results.results.map(result => {
            i++;
            return `**${i}:** ${result.title}`
        })

        //create embed
        let fields = []
        i = 0;
        for (const title of titles){
            fields[i] = new Object();
            fields[i].name = "\u200B";
            fields[i++].value = title;
        }
        const embed = new EmbedBuilder()
        .setDescription(`results for **${option1}**: select a track`)
        .setColor(client.color)
        .addFields(fields)
        i = 0;
        let buttons = []
        for (const result of results.results){
            let customID = `P ${result.id} ${fields[i].value}`.substring(0, 99)
            buttons[i++] = new ButtonBuilder()
            .setCustomId(customID)
            .setStyle(ButtonStyle.Secondary)
            .setLabel(`${i}`);
            if (i === 5)
                break;
        }

        await interaction.reply({
            // content: "yo",
            ephemeral: false,
            embeds: [embed],
            components: [
                new ActionRowBuilder().addComponents(buttons)
            ]
        })
    },

    usage: "play a video from youtube. you can either use the video's URL or search for an input"
}