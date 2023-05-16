import Tournament from "../../schemas/tournament.js";

function arrayRemove(arr, value) {
  return arr.filter(function (ele) {
    return ele != value;
  });
}

export async function executeVote(interaction) {
  const idSplit = interaction.component.customId.split(" ");
  let tourney = await Tournament.findOne({ _id: idSplit[1] });
  let match;
  let msg;
  console.log(idSplit);
  if (idSplit[2] === "1")
    match = tourney.loserRounds[idSplit[3]].matches[idSplit[4]];
  else match = tourney.winnerRounds[idSplit[3]].matches[idSplit[4]];
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
        match.membersLeft.push(interaction.member);
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
        match.membersRight.push(interaction.member);
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
  console.log(interaction.member.displayName);
  await interaction.editReply({
    content: msg,
  });
}

export default {
  data: {
    name: "tourney",
  },
  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });
    client.voteQueue.enqueue(interaction);
  },
};
