import {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} from "discord.js";
import Round, { IRound } from "../../schemas/round";
import Match from "../../schemas/match";
import Tournament, { ITournament } from "../../schemas/tournament";
import mongoose from "mongoose";
import GuildCommandInteraction from "../../classes/GuildCommandInteraction.js";
import { Mendicant } from "../../classes/Mendicant.js";

const maxMatches = 16;

type Tournament = mongoose.Document<unknown, {}, ITournament> & ITournament & { _id: mongoose.Types.ObjectId; };

// export const generateId = (size = 32) => {
//     const bytesArray = new Uint8Array(size / 2)

//     window.crypto.getRandomValues(bytesArray) // search alternative to this
//     return [...bytesArray]
//       .map((number) => number.toString(16).padStart(2, '0'))
//       .join('')
//   }

async function showResults(tourney: Tournament, round: IRound, interaction: GuildCommandInteraction) {
  let i = tourney.currentMatch - round.matches[0].matchId + 1;
  let count = round.matches.length;
  count = count > maxMatches + i ? maxMatches + i : count;

  tourney.currentMatch += count - i;
  let currentBracket = tourney.currentBracket;
  let currentLoser = tourney.currentLoser;
  let currentWinner = tourney.currentWinner;
  await tourney.save().catch(console.error);
  let j = 0;
  let componentArray = [];
  for (; i < count; i++) {
    j++;
    let match = round.matches[i];
    match.open = false;
    match.winner =
      !match.playerLeft || match.votesRight > match.votesLeft
        ? match.playerRight
        : match.playerLeft;
    match.loser =
      !match.playerLeft || match.votesRight > match.votesLeft
        ? match.playerLeft
        : match.playerRight;
    round.matches[i] = match;
    if (round.winnerBracket)
      tourney.winnerRounds[tourney.currentWinner] = round;
    else tourney.loserRounds[tourney.currentLoser] = round;
    await tourney.save().catch(console.error);
    if (match.playerLeft && match.playerRight) {
      const emote1 = round.matches[i].playerLeft.split(":")[2].slice(0, -1);
      const emote2 = round.matches[i].playerRight.split(":")[2].slice(0, -1);

      const button1 = new ButtonBuilder()
        .setCustomId(
          `T ${tourney._id} ${currentBracket} ${
            currentBracket ? currentLoser : currentWinner
          } ${i} left`
        )
        .setStyle(ButtonStyle.Secondary)
        .setLabel(`[${match.votesLeft}]`)
        .setEmoji(emote1);

      const button2 = new ButtonBuilder()
        .setCustomId(
          `T ${tourney._id} ${currentBracket} ${
            currentBracket ? currentLoser : currentWinner
          } ${i} right`
        )
        .setStyle(ButtonStyle.Secondary)
        .setLabel(`[${match.votesRight}]`)
        .setEmoji(emote2);
      componentArray.push(
        new ActionRowBuilder<ButtonBuilder>().addComponents(button1, button2)
      );
    } else {
      if (componentArray.length) {
        j = 0;
        interaction.channel!.send({ components: componentArray });
        componentArray = [];
      }
      interaction.channel!.send(`${i + 1} bye`);
    }
    if ((j === 5 || i + 1 === count) && componentArray.length) {
      j = 0;
      interaction.channel!.send({ components: componentArray });
      componentArray = [];
    }
  }
  await tourney.save().catch(console.error);
  return tourney;
}

async function showTourneyWinner(tourney: Tournament, round: IRound, interaction: GuildCommandInteraction, mendicant: Mendicant) {
  const winner = round.matches[0].winner;
  let emote = mendicant.emojis.cache.find(
    (emoji) => emoji.id === winner.split(":")[2].slice(0, -1)
  );
  const embed = new EmbedBuilder()
    .setTitle(tourney.name)
    .setDescription(`🎊🎉 ${winner} wins!!🎉🎊 🏆`)
    .setColor(mendicant.color)
    .setImage(emote!.url);
  await interaction.channel!.send({
    embeds: [embed],
  });
}

async function createLB1(tourney: Tournament, round: IRound) {
  for (let i = 0; i < round.numPlayers / 2; i++) {
    let match = new Match({
      _id: new mongoose.Types.ObjectId(),
      matchId: i + 1 + tourney.currentMatch,
      playerLeft:
        tourney.winnerRounds[tourney.currentWinner].matches[i * 2].loser,
      playerRight: tourney.winnerRounds[0].matches[i * 2 + 1].loser,
      votesLeft: 0,
      votesRight: 0,
      open: true,
    });
    round.matches[i] = match;
  }
  tourney.currentBracket = 1;
  tourney.currentLoser++;
  tourney.loserRounds[tourney.currentLoser] = round;
  await tourney.save().catch(console.error);
  return [round, tourney];
}

async function createLB2(tourney: Tournament, round: IRound) {
  const prevWB = tourney.winnerRounds[tourney.currentWinner];
  const prevLB = tourney.loserRounds[tourney.currentLoser];
  const j = prevWB.matches.length - 1;

  for (let i = 0; i < round.numPlayers / 2; i++) {
    let match = new Match({
      _id: new mongoose.Types.ObjectId(),
      matchId: i + 1 + tourney.currentMatch,
      playerLeft: prevWB.matches[j - i].loser,
      playerRight: prevLB.matches[i].winner,
      votesLeft: 0,
      votesRight: 0,
      open: true,
    });
    round.matches[i] = match;
  }
  tourney.currentBracket = 1;
  tourney.currentLoser++;
  tourney.loserRounds[tourney.currentLoser] = round;
  await tourney.save().catch(console.error);
  return [round, tourney];
}

async function createLB4(tourney: Tournament, round: IRound) {
  const prevWB = tourney.winnerRounds[tourney.currentWinner];
  const prevLB = tourney.loserRounds[tourney.currentLoser];
  let j = prevWB.matches.length / 2 - 1;
  let i = 0;
  for (i = 0; i < round.numPlayers / 2 / 2; i++) {
    let match = new Match({
      _id: new mongoose.Types.ObjectId(),
      matchId: i + 1 + tourney.currentMatch,
      playerLeft: prevWB.matches[j - i].loser,
      playerRight: prevLB.matches[i].winner,
      votesLeft: 0,
      votesRight: 0,
      open: true,
    });
    round.matches[i] = match;
  }
  j = prevWB.matches.length - 1 + i;
  for (i = round.numPlayers / 2 / 2; i < round.numPlayers / 2; i++) {
    let match = new Match({
      _id: new mongoose.Types.ObjectId(),
      matchId: i + 1 + tourney.currentMatch,
      playerLeft: prevWB.matches[j - i].loser,
      playerRight: prevLB.matches[i].winner,
      votesLeft: 0,
      votesRight: 0,
      open: true,
    });
    round.matches[i] = match;
  }
  tourney.currentBracket = 1;
  tourney.currentLoser++;
  tourney.loserRounds[tourney.currentLoser] = round;
  await tourney.save().catch(console.error);
  return [round, tourney];
}

async function createLB6(tourney: Tournament, round: IRound) {
  const prevWB = tourney.winnerRounds[tourney.currentWinner];
  const prevLB = tourney.loserRounds[tourney.currentLoser];
  let j = Math.floor(prevWB.matches.length / 2);

  for (let i = 0; i < Math.floor(round.numPlayers / 2 / 2); i++) {
    let match = new Match({
      _id: new mongoose.Types.ObjectId(),
      matchId: i + 1 + tourney.currentMatch,
      playerLeft: prevWB.matches[j + i].loser,
      playerRight: prevLB.matches[i].winner,
      votesLeft: 0,
      votesRight: 0,
      open: true,
    });
    round.matches[i] = match;
  }
  for (
    let i = Math.floor(round.numPlayers / 2 / 2);
    i < Math.floor(round.numPlayers / 2);
    i++
  ) {
    let match = new Match({
      _id: new mongoose.Types.ObjectId(),
      matchId: i + 1 + tourney.currentMatch,
      playerLeft: prevWB.matches[i - j].loser,
      playerRight: prevLB.matches[i].winner,
      votesLeft: 0,
      votesRight: 0,
      open: true,
    });
    round.matches[i] = match;
  }
  tourney.currentBracket = 1;
  tourney.currentLoser++;
  tourney.loserRounds[tourney.currentLoser] = round;
  await tourney.save().catch(console.error);
  return [round, tourney];
}

async function createLB8(tourney: Tournament, round: IRound) {
  const prevWB = tourney.winnerRounds[tourney.currentWinner];
  const prevLB = tourney.loserRounds[tourney.currentLoser];

  for (let i = 0; i < round.numPlayers / 2; i++) {
    let match = new Match({
      _id: new mongoose.Types.ObjectId(),
      matchId: i + 1 + tourney.currentMatch,
      playerLeft: prevWB.matches[i].loser,
      playerRight: prevLB.matches[i].winner,
      votesLeft: 0,
      votesRight: 0,
      open: true,
    });
    round.matches[i] = match;
  }
  tourney.currentBracket = 1;
  tourney.currentLoser++;
  tourney.loserRounds[tourney.currentLoser] = round;
  await tourney.save().catch(console.error);
  return [round, tourney];
}

async function newRound(tourney: Tournament, prevRound: IRound) {
  console.log("new round");
  //if previous round was winner bracket, next one has to be a loser
  if (prevRound.winnerBracket) {
    console.log(1);
    let round = new Round({
      _id: new mongoose.Types.ObjectId(),
      name: `LB${tourney.currentLoser + 1}`,
      winnerBracket: false,
      // if this is the first loser bracket round, it should be minor
      minor: tourney.currentLoser ? false : true,
    });
    round.numPlayers = round.minor
      ? tourney.currentLoser == 0
        ? tourney.winnerRounds[tourney.currentWinner].numPlayers / 2
        : tourney.loserRounds[tourney.currentLoser].numPlayers
      : tourney.loserRounds[tourney.currentLoser].numPlayers;
    if (tourney.currentLoser + 1 == 1) {
      return await createLB1(tourney, round);
    }
    switch ((tourney.currentLoser + 1) % 8) {
      case 0:
        return await createLB8(tourney, round);
      case 2:
        return await createLB2(tourney, round);
      case 4:
        return await createLB4(tourney, round);
      case 6:
        return await createLB6(tourney, round);

      default:
        return await createLB2(tourney, round);
    }
  }

  //if previous round was a minor loser bracket, next one has to be a winner
  else if (prevRound.minor) {
    console.log(2);
    let RO = tourney.winnerRounds[tourney.currentWinner].matches.length;
    let round = new Round({
      _id: new mongoose.Types.ObjectId(),
      name: `RO${RO}`,
      numPlayers: RO,
      winnerBracket: true,
    });

    for (let i = 0; i < round.numPlayers / 2; i++) {
      let match = new Match({
        _id: new mongoose.Types.ObjectId(),
        matchId: i + 1 + tourney.currentMatch,
        playerLeft:
          tourney.winnerRounds[tourney.currentWinner].matches[i * 2].winner,
        playerRight:
          tourney.winnerRounds[tourney.currentWinner].matches[i * 2 + 1].winner,
        votesLeft: 0,
        votesRight: 0,
        open: true,
      });
      round.matches[i] = match;
    }
    tourney.currentBracket = 0;
    tourney.currentWinner++;
    tourney.winnerRounds[tourney.currentWinner] = round;
    await tourney.save().catch(console.error);
    return [round, tourney];
  }

  //if previous round was a major loser bracket, next one is a minor LB except if
  // its the LB finals
  else if (prevRound.numPlayers != 2) {
    console.log(3);
    let round = new Round({
      _id: new mongoose.Types.ObjectId(),
      name: `LB${tourney.currentLoser + 1}`,
      numPlayers: tourney.loserRounds[tourney.currentLoser].numPlayers / 2,
      winnerBracket: false,
      minor: true,
    });
    for (let i = 0; i < round.numPlayers / 2; i++) {
      let match = new Match({
        _id: new mongoose.Types.ObjectId(),
        matchId: i + 1 + tourney.currentMatch,
        playerLeft:
          tourney.loserRounds[tourney.currentLoser].matches[i * 2].winner,
        playerRight:
          tourney.loserRounds[tourney.currentLoser].matches[i * 2 + 1].winner,
        votesLeft: 0,
        votesRight: 0,
        open: true,
      });
      round.matches[i] = match;
    }
    tourney.currentBracket = 1;
    tourney.currentLoser++;
    tourney.loserRounds[tourney.currentLoser] = round;
    await tourney.save().catch(console.error);
    return [round, tourney];
  }

  //grandFinals
  else {
    let round = new Round({
      _id: new mongoose.Types.ObjectId(),
      name: `GRAND FINALS`,
      numPlayers: 2,
      winnerBracket: true,
    });

    let match = new Match({
      _id: new mongoose.Types.ObjectId(),
      matchId: 1 + tourney.currentMatch,
      playerLeft: tourney.winnerRounds[tourney.currentWinner].matches[0].winner,
      playerRight: tourney.loserRounds[tourney.currentLoser].matches[0].winner,
      votesLeft: 0,
      votesRight: 0,
      open: true,
    });
    round.matches[0] = match;
    tourney.currentBracket = 0;
    tourney.currentWinner++;
    tourney.winnerRounds[tourney.currentWinner] = round;
    await tourney.save().catch(console.error);
    return [round, tourney];
  }
}

function printNextMatchesCompact(tourney: Tournament, round: IRound, interaction: GuildCommandInteraction) {
  let i = tourney.currentMatch - round.matches[0].matchId + 1;
  let count = round.matches.length;
  count = count > maxMatches + i ? maxMatches + i : count;
  console.log(`i: ${i}, count: ${count}`);
  let j = 0;
  let componentArray = [];
  for (; i < count; i++) {
    j++;
    let match = round.matches[i];
    console.log(match.playerLeft);
    console.log(match.playerRight);
    if (match.playerLeft && match.playerRight) {
      const emote1 = round.matches[i].playerLeft.split(":")[2].slice(0, -1);
      const emote2 = round.matches[i].playerRight.split(":")[2].slice(0, -1);

      const button1 = new ButtonBuilder()
        .setCustomId(
          `T ${tourney._id} ${tourney.currentBracket} ${
            tourney.currentBracket
              ? tourney.currentLoser
              : tourney.currentWinner
          } ${i} left`
        )
        .setStyle(ButtonStyle.Secondary)
        .setEmoji(emote1);

      const button2 = new ButtonBuilder()

        .setCustomId(
          `T ${tourney._id} ${tourney.currentBracket} ${
            tourney.currentBracket
              ? tourney.currentLoser
              : tourney.currentWinner
          } ${i} right`
        )
        .setStyle(ButtonStyle.Secondary)
        .setEmoji(emote2);
      componentArray.push(
        new ActionRowBuilder<ButtonBuilder>().addComponents(button1, button2)
      );
    } else {
      interaction.channel!.send(`${i + 1} bye`);
    }
    console.log(`i: ${i}`);
    if ((j === 5 || i + 1 === count) && componentArray.length) {
      j = 0;
      interaction.channel!.send({ components: componentArray });
      componentArray = [];
    }
  }
}

function printNextMatchesFull(tourney: Tournament, round: IRound, interaction: GuildCommandInteraction) {
  let i = tourney.currentMatch - round.matches[0].matchId + 1;
  let count = round.matches.length;
  count = count > maxMatches + i ? maxMatches + i : count;
  console.log(`i: ${i}, count: ${count}`);
  let componentArray = [];
  for (; i < count; i++) {
    let match = round.matches[i];
    console.log(match.playerLeft);
    console.log(match.playerRight);
    if (match.playerLeft && match.playerRight) {
      const emote1 = round.matches[i].playerLeft; //.split(':')[2].slice(0, -1);
      const emote2 = round.matches[i].playerRight; //.split(':')[2].slice(0, -1);

      const button1 = new ButtonBuilder()
        .setCustomId(
          `T ${tourney._id} ${tourney.currentBracket} ${
            tourney.currentBracket
              ? tourney.currentLoser
              : tourney.currentWinner
          } ${i} left`
        )
        .setStyle(ButtonStyle.Secondary)
        .setEmoji("1️⃣");

      const button2 = new ButtonBuilder()

        .setCustomId(
          `T ${tourney._id} ${tourney.currentBracket} ${
            tourney.currentBracket
              ? tourney.currentLoser
              : tourney.currentWinner
          } ${i} right`
        )
        .setStyle(ButtonStyle.Secondary)
        .setEmoji("2️⃣");
      componentArray.push(
        new ActionRowBuilder<ButtonBuilder>().addComponents(button1, button2)
      );

      interaction.channel!.send({
        content: `${emote1} :crossed_swords: ${emote2}`,
        components: componentArray,
      });
      componentArray = [];
    } else {
      interaction.channel!.send(`${i + 1} bye`);
    }
    console.log(`i: ${i}`);
  }
}

export default {
  data: new SlashCommandBuilder()
    .setName("tourney-next")
    .setDescription("post next matches for the tournament")
    .addStringOption((option) =>
      option.setName("name").setDescription("tournament name").setRequired(true)
    ),
  async execute(interaction: GuildCommandInteraction, mendicant: Mendicant) {
    const name = interaction.options.getString("name");

    await interaction.deferReply();
    let tourney = await Tournament.findOne({
      name: name,
      host: interaction.member.toString(),
    });
    if (!tourney) {
      await interaction.editReply({
        content: `Error: You are not this tournament's host. Did you type the name correctly?`,
      });
      return;
    }

    let round = tourney.currentBracket
      ? tourney.loserRounds[tourney.currentLoser]
      : tourney.winnerRounds[tourney.currentWinner];
    console.log(round.matches.length);
    if (!tourney.open) {
      tourney.open = true;
      await tourney.save().catch(console.error);
      await interaction.channel?.send({
        content: `${round.name}: `,
      });
    } else {
      //show previous day's results and close matches
      await interaction.channel?.send({
        content: "Last day's results:",
      });
      tourney = await showResults(tourney, round, interaction);
    }
    console.log(round.matches.length);
    //if grandfinals
    if (round.name == "GRAND FINALS") {
      await interaction.editReply("GRAND FINALS RESULT");
      await showTourneyWinner(tourney, round, interaction, mendicant);
      return;
    }
    //if round is over and its not grandfinals
    else if (
      tourney?.currentMatch ==
      round.matches.length + round.matches[0].matchId - 1
    ) {
      [round, tourney] = await newRound(tourney, round) as [IRound, Tournament]; //TODO: CHECK THIS
      interaction.channel!.send(`${round.name}: `);
    }

    interaction.channel!.send(`Next matches:`);
    printNextMatchesFull(tourney, round, interaction);
    await interaction.editReply("NEW DAY");
  },

  usage:
    "You can only use this command on tournaments YOU created. Use the name you gave your tournament when you used `/create-tourney`. Once this command is used the revealed matches are closed: give some time to your members to vote.",
};
