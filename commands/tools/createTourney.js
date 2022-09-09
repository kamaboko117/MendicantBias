const { SlashCommandBuilder } = require('discord.js');
const Tournament = require('../../schemas/tournament');
const mongoose = require('mongoose');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('createtourney')
        .setDescription('creates an emotedokai tournament')
        .addStringOption(option =>
            option.setName('name')
                .setDescription(`the tournament's name`)
                .setRequired(true)
            ),
    
        async execute(interaction, client) {
            const option1 = interaction.options.getString('emote1')
            tourneyProfile = new Tournament({
                _id: mongoose.Types.ObjectId(),
                name: option1,
            });
            for (const emoji of client.emojis.cache){
                tourneyProfile.players.push(emoji.toString());
            }
            await tourneyProfile.save().catch(console.error);
            await interaction.reply({
                content: "pouet"
            });
    }
}