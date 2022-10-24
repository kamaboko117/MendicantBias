const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('insult-jo')
        .setDescription('Insults the doggo named Johnnyeco'),
    
        async execute(interaction, client) {
            
            await interaction.reply({
                content: "<@170617264662511616> you absolute faggot"
            });
    },

    usage: 'Use carefully: Yellow Members might endure the consequences of this action'
}