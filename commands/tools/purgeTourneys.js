const {
    SlashCommandBuilder,
} = require('discord.js');
const mongoose = require('mongoose');
const Tournament = require('../../schemas/tournament');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('purge-tourney')
        .setDescription('delete all tourneys from database'),
    async execute(interaction, client) {
        await Tournament.deleteMany({});
        await interaction.reply('done');
    }
}