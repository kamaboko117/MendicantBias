const Tournament = require("../../schemas/tournament");

function arrayRemove(arr, value) {
    return arr.filter(function (ele) {
        return ele != value;
    });
}

module.exports = {
    data: {
        name: "tourney",
    },
    async execute(interaction, client) {
        const matchId = interaction.component.customId.split(" ");
        tourneyProfile = await Tournament.findOne({ _id: matchId[1] });
        console.log(matchId);
        if (matchId[2] === "1")
            matchProfile =
                tourneyProfile.loserRounds[matchId[3]].matches[matchId[4]];
        else
            matchProfile =
                tourneyProfile.winnerRounds[matchId[3]].matches[matchId[4]];
        if (!matchProfile) {
            newMessage = "match does not exist in database: Probably deleted";

            //if match is closed, button is used to see results
        } else if (!matchProfile.open) {
            newMessage = `votes for ${matchProfile.playerLeft}\n`;
            newMessage += matchProfile.votesLeft
                ? `${matchProfile.membersLeft}`
                : "noone";
            newMessage += `\nvotes for ${matchProfile.playerRight}\n`;
            newMessage += matchProfile.votesRight
                ? `${matchProfile.membersRight}`
                : "noone";

            //if match is still open, button is used to vote
        } else {
            if (matchId[5] == "left") {
                if (
                    matchProfile.membersLeft.includes(
                        interaction.member.toString()
                    )
                )
                    newMessage = `${interaction.member}: you've already voted`;
                else {
                    matchProfile.votesLeft++;
                    newMessage = `voted for: ${matchProfile.playerLeft}`;
                    matchProfile.membersLeft.push(interaction.member);
                    if (
                        matchProfile.membersRight.includes(
                            interaction.member.toString()
                        )
                    ) {
                        matchProfile.membersRight = arrayRemove(
                            matchProfile.membersRight,
                            interaction.member.toString()
                        );
                        matchProfile.votesRight--;
                    }
                }
            } else if (matchId[5] == "right") {
                if (
                    matchProfile.membersRight.includes(
                        interaction.member.toString()
                    )
                )
                    newMessage = `${interaction.member}: you've already voted`;
                else {
                    matchProfile.votesRight++;
                    newMessage = `voted for: ${matchProfile.playerRight}`;
                    matchProfile.membersRight.push(interaction.member);
                    if (
                        matchProfile.membersLeft.includes(
                            interaction.member.toString()
                        )
                    ) {
                        matchProfile.membersLeft = arrayRemove(
                            matchProfile.membersLeft,
                            interaction.member.toString()
                        );
                        matchProfile.votesLeft--;
                    }
                }
            } else newMessage = "what?";
            await tourneyProfile.save().catch(console.error);
        }
        console.log(interaction.member.displayName);
        await interaction.reply({
            content: newMessage,
            ephemeral: true,
        });
    },
};
