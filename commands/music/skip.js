const { SlashCommandBuilder } = require('discord.js');
const { getVoiceConnection } = require("@discordjs/voice");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('skip current song'),
    
    async execute(interaction, client) {
        console.log(`${interaction.member.displayName} used /skip`)
        const { voice } = interaction.member;
        if (!voice.channelId){
            interaction.reply("Error: You are not in a voice channel");
            return ;
        }
        const connection = getVoiceConnection(interaction.guild.id);
        if (!connection){
            await interaction.reply({
                content: "Nothing to skip",
            })
            return ;
        }
        let player = connection.state.subscription.player
        let queue = client.queues.find(queue => queue.id === interaction.guild.id)
        if (queue)
            queue = queue.queue;
        if (queue && !queue.isEmpty){
            queue.dequeue()
            player.stop();
            if (!queue.isEmpty){
                console.log("play new resource")
                player.play(queue.peek());
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