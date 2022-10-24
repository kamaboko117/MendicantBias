const { SlashCommandBuilder, VoiceChannel } = require('discord.js');
const ytdl = require('ytdl-core');
const { joinVoiceChannel } = require("@discordjs/voice");

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
        // const option1 = interaction.options.getString('url');
        // try{
        //     const stream = ytdl(option1, { filter: 'audioonly' })
        // }
        // catch (error) {
        //     interaction.reply(`ytdl module error: ${error}`);
        //     return ;
        // }

        const { voice } = interaction.member;
        
        if (!voice.channelId){
            interaction.reply("Error: You are not in a voice channel");
            return ;
        }

        const connection = joinVoiceChannel(
        {
            channelId: voice.channel,
            guildId: interaction.guildId,
            adapterCreator: interaction.guild.voiceAdapterCreator
        });
        (connection) => {
            const dispatcher = connection.play(path.join('./', 'intro.m4a'));
            dispatcher.on('end', () => {
                VoiceChannel.leave();
            })
        };
        await interaction.reply({
            content: "yo"
        })
    }
}