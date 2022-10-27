const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('get the music queue'),
    
    async execute(interaction, client) {
        //create embed
        let fields = []
        let titles = []
        if (client.queue.isEmpty){
            await interaction.reply({
                content: "Queue is empty",
                ephemeral: false,
            })
            return ;
        }
        titles[0] = `**▶️ ${client.queue.elements[0].metadata.title}**`
        for (let i = 1; i < client.queue.length; i++){
            titles[i] =  `**${i}:** ${client.queue.elements[i].metadata.title}`
        }
        let i = 0;
        for (const title of titles){
            fields[i] = new Object();
            fields[i].name = "\u200B";
            fields[i++].value = title;
        }
        const embed = new EmbedBuilder()
        .setDescription(`track list`)
        .setColor(client.color)
        .addFields(fields)

        await interaction.reply({
            // content: "yo",
            ephemeral: false,
            embeds: [embed],
        })
    },

    usage: ''
}