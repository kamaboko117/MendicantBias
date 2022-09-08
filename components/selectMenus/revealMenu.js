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
            content: `match results:\n` + matchProfile.playerLeft + ': ' + matchProfile.votesLeft
            + ' | ' + matchProfile.playerRight + ': ' + matchProfile.votesRight + '\n' +
            matchProfile.winner + ' wins !',
        });
    },
};