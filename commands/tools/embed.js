const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('embed')
        .setDescription('ye'),
    async execute(interaction, client) {
        const embed = new EmbedBuilder()
            .setTitle('ROUND')
            .setDescription('MATCH')
            .setColor(client.color)
            .setThumbnail('https://www.pngkey.com/png/full/898-8989988_crossed-swords-crossed-swords-emoji.png')
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
        const button1 = new ButtonBuilder()
            .setCustomId('test')
            .setLabel("1")
            .setStyle(ButtonStyle.Primary)
            .setEmoji("777147567465168897");
        const button2 = new ButtonBuilder()
            .setCustomId('test2')
            .setLabel("2")
            .setStyle(ButtonStyle.Primary)
        //    .setEmoji('<1013407814753988609>');
        
        await interaction.reply({
                embeds: [embed],
                components: [
                    new ActionRowBuilder().addComponents(button1, button2)
                ]
        });
        
    },
};