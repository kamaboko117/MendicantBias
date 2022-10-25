const { SlashCommandBuilder, VoiceChannel } = require('discord.js');
const ytdl = require('ytdl-core');
const {
    joinVoiceChannel,
    getVoiceConnection,
    VoiceConnectionStatus,
    createAudioPlayer,
    createAudioResource,
    StreamType
} = require("@discordjs/voice");
const { connection } = require('mongoose');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('plays a video from youtube in voice chat')
        .addStringOption(option =>
            option.setName('url')
                .setDescription('youtube video link')
                .setRequired(true)
            ),
    async execute(interaction, client) {
        const option1 = interaction.options.getString('url');
        let stream;
        try{
            stream = ytdl(option1, { filter: 'audioonly' })
        } catch (error) {
            interaction.reply(`ytdl module error: ${error}`);
            return ;
        }
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
            const dispatcher = con.subscribe(player);
            let resource = createAudioResource(stream, {
                inputType: StreamType.Arbitrary
            });
            player.play(resource);
        })
        
        await interaction.reply({
            content: "yo",
            ephemeral: true
        })
    }
}