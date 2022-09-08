const Match = require ('../../schemas/match');
const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const mongoose = require('mongoose');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('creatematch')
        .setDescription('creates an emotedokai match')
        .addStringOption(option =>
            option.setName('emote1')
                .setDescription('the first emote')
                .setRequired(true)
            )
        .addStringOption(option =>
                option.setName('emote2')
                    .setDescription('the second emote')
                    .setRequired(true)
                ),
    
    async execute(interaction, client) {
        const option1 = interaction.options.getString('emote1');
        const option2 = interaction.options.getString('emote2');
        const embed = new EmbedBuilder()
            .setTitle('random match')
            // .setDescription('MATCH')
            .setColor(client.color)
            // .setThumbnail('https://www.pngkey.com/png/full/898-8989988_crossed-swords-crossed-swords-emoji.png')
            .setFooter({
                iconURL: 'https://www.dlf.pt/png/big/10/109431_picardia-png.png',
                text: 'emotedokai season 2'
            })
            .setURL('https://challonge.com')
            .addFields([
                {
                    name: `emote 1`,
                    value: option1,
                    inline: true
                },
                {
                    name: 'emote 2',
                    value: option2,
                    inline: true
                }
            ]);
        const emote1 = (client.emojis.cache.find(emoji => emoji.name === option1.split(':')[1]).id);
        const emote2 = (client.emojis.cache.find(emoji => emoji.name === option2.split(':')[1]).id);
        console.log(emote1, emote2);

        let matchId = 1;//await Match.estimatedDocumentCount();
        let matchProfile = await Match.findOne({matchId: matchId});
        console.log(matchProfile);
        while (matchProfile[0]){
            matchId++;
        }
        console.log(matchId);
        matchProfile = new Match({
            _id: mongoose.Types.ObjectId(),
            matchId: matchId,
            playerLeft: emote1,
            playerRight: emote2,
            votesLeft: 0,
            votesRight: 0,
            open: true
        });
        await matchProfile.save().catch(console.error);
        client.matchCount++;
        console.log(matchProfile);

        //create buttons
        const button1 = new ButtonBuilder()
            .setCustomId(matchProfile.matchId + ' left')
            // .setLabel(option1)
            .setStyle(ButtonStyle.Primary)
            .setEmoji(emote1);
        const button2 = new ButtonBuilder()
            .setCustomId(matchProfile.matchId + ' right')
            // .setLabel("2")
            .setStyle(ButtonStyle.Primary)
            .setEmoji(emote2);

        await interaction.reply({
                embeds: [embed],
                components: [
                    new ActionRowBuilder().addComponents(button1, button2)
                ]
        });
    },
};