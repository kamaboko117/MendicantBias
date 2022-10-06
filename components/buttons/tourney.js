const { Match } = require ('../../schemas/match');
const tournament = require('../../schemas/tournament');
const Tournament = require('../../schemas/tournament');

function arrayRemove(arr, value) { 
    
    return arr.filter(function(ele){ 
        return ele != value; 
    });
}

module.exports = {
    data: {
        name: 'tourney'
    },
    async execute(interaction, client) {
        const matchId = interaction.component.customId.split(' ');
        tourneyProfile = await Tournament.findOne({_id: matchId[1]})
        console.log(matchId);
        if (matchId[2] === "1")
            matchProfile = tourneyProfile.loserRounds[matchId[3]].matches[matchId[4]];
        else
            matchProfile = tourneyProfile.winnerRounds[matchId[3]].matches[matchId[4]];
        if (!matchProfile){
            newMessage = 'match does not exist in database: Probably deleted'
        }else if (!matchProfile.open){
            if (matchId[5] == 'left'){
                newMessage = `votes for ${matchProfile.playerLeft}\n`
                newMessage += matchProfile.votesLeft ?
                    `${matchProfile.membersLeft}` : 'noone';
            }else if (matchId[5] == 'right'){
                newMessage = `votes for ${matchProfile.playerRight}\n`
                newMessage += matchProfile.votesRight ?
                    `${matchProfile.membersRight}` : 'noone';
            }
        }else{
            if (matchId[5] == 'left'){
                if (matchProfile.membersLeft.includes(interaction.member.toString()))
                    newMessage = `${interaction.member}: you've already voted`;
                else{
                    matchProfile.votesLeft++;
                    newMessage = `voted for: ${matchProfile.playerLeft}`;
                    matchProfile.membersLeft.push(interaction.member);
                    if (matchProfile.membersRight.includes(interaction.member.toString())){
                        matchProfile.membersRight = arrayRemove(matchProfile.membersRight, interaction.member.toString());
                        matchProfile.votesRight--;
                    }
                }
            }else if (matchId[5] == 'right'){
                if (matchProfile.membersRight.includes(interaction.member.toString()))
                    newMessage = `${interaction.member}: you've already voted`;
                else{
                    matchProfile.votesRight++;
                    newMessage = `voted for: ${matchProfile.playerRight}`;
                    matchProfile.membersRight.push(interaction.member);
                    if (matchProfile.membersLeft.includes(interaction.member.toString())){
                        matchProfile.membersLeft = arrayRemove(matchProfile.membersLeft, interaction.member.toString());
                        matchProfile.votesLeft--;
                    }
                }
            }else
                newMessage = 'what?';
            await tourneyProfile.save().catch(console.error);        
        }
        if (matchProfile)
            console.log(matchProfile.matchId);
        console.log(interaction.member.displayName);
        await interaction.reply({
            content: newMessage,
            ephemeral: true
        })
    }
}