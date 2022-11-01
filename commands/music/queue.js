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
        titles[0] = `**▶️ ${client.queue.elements[client.queue.head].metadata.title}**`
        let j = 1
        for (let i = client.queue.head + 1; i < client.queue.tail; i++){
            titles[j] =  `**${j++}:** ${client.queue.elements[i].metadata.title}`
        }
        let i = 0;
        for (const title of titles){
            fields[i] = new Object();
            fields[i].name = "\u200B";
            fields[i++].value = title;
            if (i === 25)
                break;
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