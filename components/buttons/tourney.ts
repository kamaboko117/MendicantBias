import type GuildButtonInteraction from "../../classes/GuildButtonInteraction.js";
import type { Mendicant } from "../../classes/Mendicant.js";
import Tournament from "../../schemas/tournament";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function arrayRemove(arr: any[], value: any) {
  return arr.filter(function (ele) {
    return ele != value;
  });
}

export async function executeVote(interaction: GuildButtonInteraction) {
  const idSplit = interaction.customId.split(" ");
  const tourney = await Tournament.findOne({ _id: idSplit[1] });
  if (!tourney) {
    await interaction.editReply({
      content: "Tournament does not exist in database: Probably deleted",
    });
    return;
  }
  let match;
  let msg;
  console.log(idSplit);
  if (idSplit[2] === "1")
    match = tourney.loserRounds[Number(idSplit[3])].matches[Number(idSplit[4])];
  else
    match =
      tourney.winnerRounds[Number(idSplit[3])].matches[Number(idSplit[4])];
  if (!match) {
    msg = "match does not exist in database: Probably deleted";

    //if match is closed, button is used to see results
  } else if (!match.open) {
    msg = `votes for ${match.playerLeft}\n`;
    msg += match.votesLeft ? `${match.membersLeft}` : "noone";
    msg += `\nvotes for ${match.playerRight}\n`;
    msg += match.votesRight ? `${match.membersRight}` : "noone";

    //if match is still open, button is used to vote
  } else {
    if (idSplit[5] == "left") {
      if (match.membersLeft.includes(interaction.member.toString()))
        msg = `${interaction.member}: You've already voted`;
      else {
        match.votesLeft++;
        msg = `voted for: ${match.playerLeft}`;
        match.membersLeft.push(interaction.member.toString());
        if (match.membersRight.includes(interaction.member.toString())) {
          match.membersRight = arrayRemove(
            match.membersRight,
            interaction.member.toString()
          );
          match.votesRight--;
        }
      }
    } else if (idSplit[5] == "right") {
      if (match.membersRight.includes(interaction.member.toString()))
        msg = `${interaction.member}: You've already voted`;
      else {
        match.votesRight++;
        msg = `Voted for: ${match.playerRight}`;
        match.membersRight.push(interaction.member.toString());
        if (match.membersLeft.includes(interaction.member.toString())) {
          match.membersLeft = arrayRemove(
            match.membersLeft,
            interaction.member.toString()
          );
          match.votesLeft--;
        }
      }
    } else msg = "what?";
    await tourney.save().catch(console.error);
  }
  console.log(interaction.user.username);
  await interaction.editReply({
    content: msg,
  });
}

export default {
  data: {
    name: "tourney",
  },
  async execute(interaction: GuildButtonInteraction, mendicant: Mendicant) {
    await interaction.deferReply({ ephemeral: true });
    mendicant.voteQueue.enqueue(interaction);
  },
};
