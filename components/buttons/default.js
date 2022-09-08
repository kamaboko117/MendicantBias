const Match = require ('../../schemas/match');

module.exports = {
    data: {
        name: 'default'
    },
    async execute(interaction, client) {
        console.log(interaction.component.customId.split(' ')[0]);
        const matchId = interaction.component.customId.split(' ');
        matchProfile = await Match.findOne({matchId: matchId[0]});
        console.log(matchProfile);
        if (!matchProfile){
            await interaction.reply({
                content: 'no code for this button'
            })
        }else{
            if (matchId[1] == 'left'){
                matchProfile.votesLeft++;
                await interaction.reply({
                    content: 'voted for: ' + matchProfile.playerLeft
                })
            }else if (matchId[1] == 'right'){
                matchProfile.votesRight++;
                await interaction.reply({
                    content: 'voted for: ' + matchProfile.playerRight
                })
            }
            await matchProfile.save().catch(console.error);
            
        }
    }
}