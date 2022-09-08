const { match } = require('assert');
const Match = require ('../../schemas/match');

module.exports = {
    data: {
        name: 'default'
    },
    async execute(interaction, client) {
        console.log(interaction.component.customId.split(' ')[0]);
        const matchId = interaction.component.customId.split(' ');
        matchProfile = await Match.findOne({_id: matchId[0]});
        console.log(matchProfile);
        if (!matchProfile){
            newMessage = 'no code for this button'
        }else if (!matchProfile.open){
            newMessage = '❌ match is closed'
        }else{
            if (matchId[1] == 'left'){
                if (matchProfile.membersLeft.includes(interaction.member.toString()))
                    newMessage = interaction.member + `: you've already voted`;
                else{
                    matchProfile.votesLeft++;
                    newMessage = 'voted for: ' + matchProfile.playerLeft;
                    matchProfile.membersLeft.push(interaction.member);
                }
            }else if (matchId[1] == 'right'){
                if (matchProfile.membersRight.includes(interaction.member.toString()))
                    newMessage = interaction.member + `: you've already voted`;
                else{
                    matchProfile.votesRight++;
                    newMessage = 'voted for: ' + matchProfile.playerRight;
                    matchProfile.membersRight.push(interaction.member);
                }
            }else
                newMessage = 'what?';
            await matchProfile.save().catch(console.error);        
        }
        console.log(interaction.member.toString());
        await interaction.reply({
            content: newMessage
        })
    }
}