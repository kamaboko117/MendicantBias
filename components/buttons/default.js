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
            newMessage = 'no code for this button'
        }else if (!matchProfile.open){
            newMessage = '❌ match is closed'
        }else{
            if (matchId[1] == 'left'){
                matchProfile.votesLeft++;
                    newMessage = 'voted for: ' + matchProfile.playerLeft   
            }else if (matchId[1] == 'right'){
                matchProfile.votesRight++;
                newMessage = 'voted for: ' + matchProfile.playerRight
            }
            else
                newMessage = 'what?';
            await matchProfile.save().catch(console.error);        
        }
        await interaction.reply({
            content: newMessage
        })
    }
}