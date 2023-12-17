import { APIButtonComponentWithCustomId, ButtonInteraction } from "discord.js";
import Match from "../../schemas/match";
import { Mendicant } from "../../classes/Mendicant";

function arrayRemove(arr: any[], value: any) {
  return arr.filter(function (ele) {
    return ele != value;
  });
}

export default {
  data: {
    name: "default",
  },
  async execute(interaction: ButtonInteraction, mendicant: Mendicant) {
    const matchId = interaction.customId.split(" ");
    let matchProfile = await Match.findOne({ _id: matchId[0] });
    let newMessage = "";
    if (!interaction.member) {
      return;
    }
    if (!matchProfile) {
      newMessage = "Match does not exist in database: Probably deleted";

      //if match is closed, button is used to see results
    } else if (!matchProfile.open) {
      newMessage = `Votes for ${matchProfile.playerLeft}\n`;
      newMessage += matchProfile.votesLeft
        ? `${matchProfile.membersLeft}`
        : "noone";

      newMessage += `\nVotes for ${matchProfile.playerRight}\n`;
      newMessage += matchProfile.votesRight
        ? `${matchProfile.membersRight}`
        : "noone";

      //if match is still open, button is used to vote
    } else {
      if (matchId[1] == "left") {
        if (matchProfile.membersLeft.includes(interaction.member.toString()))
          newMessage = `${interaction.member}: you've already voted`;
        else {
          matchProfile.votesLeft++;
          newMessage = `voted for: ${matchProfile.playerLeft}`;
          matchProfile.membersLeft.push(interaction.member.toString());
          if (
            matchProfile.membersRight.includes(interaction.member.toString())
          ) {
            matchProfile.membersRight = arrayRemove(
              matchProfile.membersRight,
              interaction.member.toString()
            );
            matchProfile.votesRight--;
          }
        }
      } else if (matchId[1] == "right") {
        if (matchProfile.membersRight.includes(interaction.member.toString()))
          newMessage = `${interaction.member}: you've already voted`;
        else {
          matchProfile.votesRight++;
          newMessage = `voted for: ${matchProfile.playerRight}`;
          matchProfile.membersRight.push(interaction.member.toString());
          if (
            matchProfile.membersLeft.includes(interaction.member.toString())
          ) {
            matchProfile.membersLeft = arrayRemove(
              matchProfile.membersLeft,
              interaction.member.toString()
            );
            matchProfile.votesLeft--;
          }
        }
      } else newMessage = "what?";
      await matchProfile.save().catch(console.error);
    }
    if (matchProfile) console.log(matchProfile.matchId);
    console.log(interaction.member.toString());
    await interaction.reply({
      content: newMessage,
      ephemeral: true,
    });
  },
};
