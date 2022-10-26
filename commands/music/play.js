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
const opts = {
    maxResults: 5,
    key: process.env.GOOGLE
}

async function    mendicantPlay(interaction, stream){
    if (interaction.inRawGuild)
            await interaction.guild.members.fetch();
        const { voice } = interaction.member;
        if (!voice.channelId){
            interaction.reply("Error: You are not in a voice channel");
            return ;
        }

        const connection = joinVoiceChannel({
            channelId: voice.channel.id,
            guildId: interaction.guild.id,
            adapterCreator: interaction.guild.voiceAdapterCreator
        });
        connection.on(VoiceConnectionStatus.Signalling, (connection) => {
            console.log(`signalling...`);
        })
        connection.on(VoiceConnectionStatus.Ready, () => {
            console.log(`Ready`);
            con = getVoiceConnection(interaction.guild.id);
            const player = createAudioPlayer();
            // An AudioPlayer will always emit an "error" event with a .resource property
            player.on('error', error => {
                console.error('Error:', error.message, 'with track', error.resource.metadata.title);
            });
            let dispatcher = con.subscribe(player);
            let resource = createAudioResource(stream, {
                inputType: StreamType.Arbitrary
            });
            player.play(resource);
            player.on(AudioPlayerStatus.Idle, dispatcher => {
                dispatcher.unsubscribe();
            })
        })
        
        await interaction.reply({
            content: "yo",
            ephemeral: false,
        })
}

module.exports = {
    mendicantPlay: mendicantPlay,

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
            let stream = ytdl(option1, { filter: 'audioonly' }).on('error', (err) =>
                interaction.channel.send(`ytdl module error: ${err}`))
            
            await mendicantPlay(interaction, stream);
            return ;
        }
        let results = (await search(option1, opts));
        if (!results){
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
            buttons[i++] = new ButtonBuilder()
            .setCustomId(`P ${result.id}`)
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
    }
}