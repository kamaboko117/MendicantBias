const { SlashCommandBuilder } = require('discord.js');
const { getVoiceConnection } = require("@discordjs/voice");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('skip current song'),
    
    async execute(interaction, client) {
        //create embed
        const connection = getVoiceConnection(interaction.member.voice.channel.guildId);
        player = connection.state.subscription.player

        if (!client.queue.isEmpty){
            client.queue.dequeue()
            if (!client.queue.isEmpty){
                console.log("play new resource")
                player.play(client.queue.peek());
            }
        } else {
            dispatcher.unsubscribe(),
            player.stop();
            console.log("unsubscribed");
        }

        await interaction.reply({
            content: "skipped",
        })
    },

    usage: ''
}