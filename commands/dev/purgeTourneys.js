const {
    SlashCommandBuilder,
} = require('discord.js');
const mongoose = require('mongoose');
const Tournament = require('../../schemas/tournament');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('purge-tourney')
        .setDescription('Delete all tourneys from database'),
    async execute(interaction, client) {
        if (interaction.member.id != '180611811412803584'){
            await interaction.reply('forbiden');
            return;
        }
        await Tournament.deleteMany({});
        await interaction.reply('done');
    }
}