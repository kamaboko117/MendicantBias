const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('embed')
        .setDescription('ye'),
    async execute(interaction, client) {
        const embed = new EmbedBuilder()
            .setTitle('ROUND')
            .setDescription('MATCH')
            .setColor(client.color)
            .setImage('https://cdn.pixabay.com/photo/2021/04/21/10/17/meme-6195988_960_720.png')
            .setThumbnail('https://discord.com/assets/e7159ba0fcc85f39f95227dd85f44aeb.svg')
            .setFooter({
                iconURL: 'https://www.dlf.pt/png/big/10/109431_picardia-png.png',
                text: 'emotedokai season 2'
            })
            .setURL('https://challonge.com')
            .addFields([
                {
                    name: `1`,
                    value: '1',
                    inline: true
                },
                {
                    name: '2',
                    value: '2',
                    inline: true
                }
            ]);
            await interaction.reply({
                embeds: [embed]
            });
        },
};