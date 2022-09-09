const { match } = require('assert');
const Match = require ('../../schemas/match');

function arrayRemove(arr, value) { 
    
    return arr.filter(function(ele){ 
        return ele != value; 
    });
}

module.exports = {
    data: {
        name: 'default'
    },
    async execute(interaction, client) {
        console.log(interaction.component.customId.split(' ')[0]);
        const matchId = interaction.component.customId.split(' ');
        matchProfile = await Match.findOne({_id: matchId[0]});
        if (!matchProfile){
            newMessage = 'match does not exist in database: Probably deleted'
        }else if (!matchProfile.open){
            newMessage = '❌ match is closed'
        }else{
            if (matchId[1] == 'left'){
                if (matchProfile.membersLeft.includes(interaction.member.toString()))
                    newMessage = `${interaction.member}: you've already voted`;
                else{
                    matchProfile.votesLeft++;
                    newMessage = `voted for: ${client.emojis.cache.get(matchProfile.playerLeft)}`;
                    matchProfile.membersLeft.push(interaction.member);
                    if (matchProfile.membersRight.includes(interaction.member.toString())){
                        matchProfile.membersRight = arrayRemove(matchProfile.membersRight, interaction.member.toString());
                        matchProfile.votesRight--;
                    }
                }
            }else if (matchId[1] == 'right'){
                if (matchProfile.membersRight.includes(interaction.member.toString()))
                    newMessage = `${interaction.member}: you've already voted`;
                else{
                    matchProfile.votesRight++;
                    newMessage = `voted for: ${client.emojis.cache.get(matchProfile.playerRight)}`;
                    matchProfile.membersRight.push(interaction.member);
                    if (matchProfile.membersLeft.includes(interaction.member.toString())){
                        matchProfile.membersLeft = arrayRemove(matchProfile.membersLeft, interaction.member.toString());
                        matchProfile.votesLeft--;
                    }
                }
            }else
                newMessage = 'what?';
            await matchProfile.save().catch(console.error);        
        }
        console.log(interaction.member.toString());
        await interaction.reply({
            content: newMessage,
            ephemeral: true
        })
    }
}