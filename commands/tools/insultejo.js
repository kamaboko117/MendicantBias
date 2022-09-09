const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('insultjo')
        .setDescription('insults the doggo named Johnnyeco'),
    
        async execute(interaction, client) {
            
            await interaction.reply({
                content: "<@170617264662511616> you absolute faggot"
            });
    }
}