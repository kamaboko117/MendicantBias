const { Match } = require ('../../schemas/match');
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
        
        const emote1 = client.emojis.cache.find(emoji => emoji.name === option1.split(':')[1]);
        const emote2 = client.emojis.cache.find(emoji => emoji.name === option2.split(':')[1]);

        if (!emote1 || !emote2){
            await interaction.reply({
                content: "Emojis missing from database: add me to the source server"
            });
            return ;
        }

        let matchId = 1;//await Match.estimatedDocumentCount();
        let matchProfile = await Match.findOne({matchId: matchId});
        while (matchProfile){
            matchId++;
            matchProfile = await Match.findOne({matchId: matchId});  
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

        //create embed
        const embed = new EmbedBuilder()
            .setTitle(`Match ${matchProfile.matchId}`)
            // .setDescription('MATCH')
            .setColor(client.color)
            // .setThumbnail('https://www.pngkey.com/png/full/898-8989988_crossed-swords-crossed-swords-emoji.png')
            // .setFooter({
            //     iconURL: 'https://www.dlf.pt/png/big/10/109431_picardia-png.png',
            //     text: 'emotedokai season 2'
            // })
            .setURL('https://challonge.com')
            // .addFields([
            //     {
            //         name: `emote 1`,
            //         value: option1,
            //         inline: true
            //     },
            //     {
            //         name: 'emote 2',
            //         value: option2,
            //         inline: true
            //     }
            // ]);

        //create buttons
        const button1 = new ButtonBuilder()
            .setCustomId(matchProfile._id + ' left')
            // .setLabel(option1)
            .setStyle(ButtonStyle.Secondary)
            .setEmoji(emote1.id);
        const button2 = new ButtonBuilder()
            .setCustomId(matchProfile._id + ' right')
            // .setLabel("2")
            .setStyle(ButtonStyle.Secondary)
            .setEmoji(emote2.id);

        await interaction.reply({
                // embeds: [embed],
                content: `match ID: ${matchId}, use /reveal ${matchId} to close and show results`,
                components: [
                    new ActionRowBuilder().addComponents(button1, button2)
                ]
        });
    },
};