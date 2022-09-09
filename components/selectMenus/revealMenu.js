const match = require('../../schemas/match');

Match = require ('../../schemas/match');

module.exports = {
    data: {
        name: `revealMenu`
    },
    async execute (interaction, client) {
        matchProfile = await Match.findOne({matchId: interaction.values[0]});
        matchProfile.open = false;
        matchProfile.winner = matchProfile.votesRight > matchProfile.votesLeft ? matchProfile.playerRight : matchProfile.playerLeft;
        matchProfile.save().catch(console.error); 
        await interaction.reply({
            content: `match results:\n${client.emojis.cache.get(matchProfile.playerLeft)} ${matchProfile.votesLeft} | ${matchProfile.votesRight} ${client.emojis.cache.get(matchProfile.playerRight)}\n${client.emojis.cache.get(matchProfile.winner)} wins !`,
        });
    },
};