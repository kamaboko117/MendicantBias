const { SlashCommandBuilder } = require("discord.js");
const { getVoiceConnection } = require("@discordjs/voice");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("skip")
        .setDescription("skip current song"),

    async execute(interaction, client) {
        console.log(`${interaction.member.displayName} used /skip`);
        const { voice } = interaction.member;
        if (!voice.channelId) {
            interaction.reply("Error: You are not in a voice channel");
            return;
        }
        const connection = getVoiceConnection(interaction.guild.id);
        if (!connection) {
            await interaction.reply({
                content: "Nothing to skip",
            });
            return;
        }

        let subscription = connection.state.subscription;
        let player = subscription.player;
        
        //player's event listener on idle will play next resource automatically 
        player.stop();

        await interaction.reply({
            content: "skipped",
        });
    },

    usage: "",
};
