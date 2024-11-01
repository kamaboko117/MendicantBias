import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  InteractionContextType,
  SlashCommandBuilder,
} from "discord.js";
import mongoose from "mongoose";
import GuildCommandInteraction from "../../classes/GuildCommandInteraction.js";
import { Mendicant } from "../../classes/Mendicant.js";
import ChallongeMatch from "../../schemas/challongeMatch";
import ChallongeTournament, {
  IChallongeTournament,
} from "../../schemas/challongeTournament";

const ChallongeAPI = `https://api.challonge.com/v1/`;
const ChallongeAPIKey = process.env.CHALLONGE_KEY;
const maxMatches = 16;

type Tourney = mongoose.Document<unknown, {}, IChallongeTournament> &
  IChallongeTournament & {
    _id: mongoose.Types.ObjectId;
  };

const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const challongeGetMatches = async (tourneyID: number) => {
  return await fetch(
    `${ChallongeAPI}tournaments/${tourneyID}/matches.json?api_key=${ChallongeAPIKey}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  )
    .then((response) => response.json())
    .then((data) => {
      return data;
    });
};

const challongeGetMatchesSorted = async (tourneyID: number) => {
  const matches = await challongeGetMatches(tourneyID);
  // there can sometimes be matches with a null suggested_play_order, we remove these from the array
  const matchesFiltered = matches.filter(
    (match: { match: { suggested_play_order: number } }) =>
      match.match.suggested_play_order
  );
  // challonge may give us a bracket reset match marked as "optional"
  // this is not supposed to even be in this tournament format so we remove it
  const matchesFilteredFiltered = matchesFiltered.filter(
    (match: { match: { optional: boolean } }) => !match.match.optional
  );

  // sort the matches by recommended play order
  matchesFilteredFiltered.sort(
    (
      a: { match: { suggested_play_order: number } },
      b: { match: { suggested_play_order: number } }
    ) => a.match.suggested_play_order - b.match.suggested_play_order
  );
  return matchesFilteredFiltered;
};

const challongeGetPlayers = async (tourneyID: number) => {
  return await fetch(
    `${ChallongeAPI}tournaments/${tourneyID}/participants.json?api_key=${ChallongeAPIKey}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  )
    .then((response) => response.json())
    .then((data) => {
      return data;
    });
};

const showFinalResults = async (
  interaction: GuildCommandInteraction,
  players: any,
  mendicant: Mendicant,
  tourney: Tourney
) => {
  const matches = await challongeGetMatchesSorted(tourney.id);
  const winner = matches[matches.length - 1].match.winner_id;
  const winnerName = players.find(
    (player: { participant: { id: number } }) =>
      player.participant.id === winner
  ).participant.name;
  const winnerEmote = winnerName.split(" | ")[1];
  const emote = mendicant.emojis.cache.find(
    (emoji) => emoji.id === winnerEmote.split(":")[2].slice(0, -1)
  );
  const embed = new EmbedBuilder()
    .setTitle(tourney.name)
    .setDescription(`🎊🎉 ${winnerName.split(" | ")[0]} wins!!🎉🎊 🏆`)
    .setColor(mendicant.color)
    .setImage(emote!.url!);
  await interaction.channel!.send({ embeds: [embed] });
  return matches.length;
};

const showPreviousResults = async (
  interaction: GuildCommandInteraction,
  mendicant: Mendicant,
  matches: any,
  players: any,
  tourneyID: number,
  tourney: Tourney
) => {
  let currentMatchIndex = 0;
  let componentArray = [];

  // skip completed matches
  while (
    matches[currentMatchIndex] &&
    matches[currentMatchIndex].match.state === "complete" &&
    currentMatchIndex < matches.length
  ) {
    currentMatchIndex++;
  }

  // close the matches and show the results
  for (
    let j = currentMatchIndex + maxMatches;
    currentMatchIndex !== j;
    currentMatchIndex++
  ) {
    const challongeMatchProfile = await ChallongeMatch.findOne({
      matchId: `${tourneyID}:${currentMatchIndex + 1}`,
    });
    if (!challongeMatchProfile) {
      break;
    }
    const player1 = challongeMatchProfile.playerLeft;
    const player2 = challongeMatchProfile.playerRight;
    challongeMatchProfile.open = false;
    challongeMatchProfile.winner =
      challongeMatchProfile.votesRight > challongeMatchProfile.votesLeft
        ? player2
        : player1;
    challongeMatchProfile.loser =
      challongeMatchProfile.votesRight > challongeMatchProfile.votesLeft
        ? player1
        : player2;
    challongeMatchProfile.save().catch(console.error); // could await here if needed
    const emote1 = player1.split(":")[2].slice(0, -1);
    const emote2 = player2.split(":")[2].slice(0, -1);
    const button1 = new ButtonBuilder()
      .setCustomId(`C ${tourneyID} ${currentMatchIndex + 1} left`)
      .setStyle(ButtonStyle.Secondary)
      .setLabel(`[${challongeMatchProfile.votesLeft}]`)
      .setEmoji(emote1);
    const button2 = new ButtonBuilder()
      .setCustomId(`C ${tourneyID} ${currentMatchIndex + 1} right`)
      .setStyle(ButtonStyle.Secondary)
      .setLabel(`[${challongeMatchProfile.votesRight}]`)
      .setEmoji(emote2);
    componentArray.push(
      new ActionRowBuilder<ButtonBuilder>().addComponents(button1, button2)
    );

    const winner_id = players.find(
      // player name is in the format "name | emote"
      (player: { participant: { name: string } }) =>
        player.participant.name.split(" | ")[1] === challongeMatchProfile.winner
    ).participant.id;
    await fetch(
      `${ChallongeAPI}tournaments/${tourneyID}/matches/${matches[currentMatchIndex].match.id}.json?api_key=${ChallongeAPIKey}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          match: {
            scores_csv: `${challongeMatchProfile.votesLeft}-${challongeMatchProfile.votesRight}`,
            winner_id: winner_id,
          },
        }),
      }
    );
  }
  while (componentArray.length) {
    const maxDiscordComponents = 5;
    // send the components 5 by 5 (maxDiscordComponents)
    const components = componentArray.slice(0, maxDiscordComponents);
    componentArray = componentArray.slice(maxDiscordComponents);
    interaction.channel!.send({ components: components });
  }
  // show the final results if we reached the end of the matches
  if (currentMatchIndex === matches.length) {
    return showFinalResults(interaction, players, mendicant, tourney);
  }

  await interaction.channel!.send({
    content: `Next matches:`,
  });

  return currentMatchIndex;
};

const updateRoundTitle = (
  interaction: GuildCommandInteraction,
  round: number,
  matches: any,
  currentMatchIndex: number
) => {
  if (currentMatchIndex === matches.length - 1) {
    interaction.channel!.send(`GRAND FINALS`);
  } else if (round > 0) {
    interaction.channel!.send(`Winner Bracket Round ${round}`);
  } else {
    interaction.channel!.send(`Loser Bracket Round ${-round}`);
  }
};

const showNextMatches = async (
  interaction: GuildCommandInteraction,
  tourney: Tourney,
  currentMatchIndex: number,
  matches: any,
  players: any
) => {
  let round = 0;
  tourney.open = true;
  await tourney.save().catch(console.error);
  let componentArray = [];
  for (
    let max = currentMatchIndex + maxMatches;
    currentMatchIndex < max;
    currentMatchIndex++
  ) {
    const match = matches[currentMatchIndex];
    if (
      !match ||
      match.match.state === "complete" ||
      match.match.state === "pending"
    ) {
      break;
    }
    if (round !== matches[currentMatchIndex].match.round) {
      round = matches[currentMatchIndex].match.round;
      updateRoundTitle(interaction, round, matches, currentMatchIndex);
    }
    const player1 = players.find(
      (player: { participant: { id: number } }) =>
        player.participant.id === match.match.player1_id
    );
    const emote1 = player1.participant.name.split(" | ")[1];
    const player2 = players.find(
      (player: { participant: { id: number } }) =>
        player.participant.id === match.match.player2_id
    );
    const emote2 = player2.participant.name.split(" | ")[1];
    const challongeMatchProfile = new ChallongeMatch({
      _id: new mongoose.Types.ObjectId(),
      matchId: `${tourney.id}:${currentMatchIndex + 1}`,
      playerLeft: emote1,
      playerRight: emote2,
      votesLeft: 0,
      votesRight: 0,
      open: true,
    });
    challongeMatchProfile.save().catch(console.error);

    const button1 = new ButtonBuilder()
      .setCustomId(`C ${tourney.id} ${currentMatchIndex + 1} left`)
      .setStyle(ButtonStyle.Secondary)
      .setEmoji("1️⃣");
    const button2 = new ButtonBuilder()
      .setCustomId(`C ${tourney.id} ${currentMatchIndex + 1} right`)
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
  }
};

export default {
  data: new SlashCommandBuilder()
    .setName("challonge-tourney-next")
    .setDescription("post next matches for the tournament")
    .addStringOption((option) =>
      option.setName("name").setDescription("tournament name").setRequired(true)
    )
    .setContexts([InteractionContextType.Guild]),

  async execute(interaction: GuildCommandInteraction, mendicant: Mendicant) {
    const name = interaction.options.getString("name");

    await interaction.deferReply();
    const tourney = await ChallongeTournament.findOne({
      name: name,
      host: interaction.member.toString(),
    });
    if (!tourney) {
      await interaction.editReply({
        content: `Error: You are not this tournament's host. Did you type the name correctly?`,
      });
      return;
    }

    let matches = await challongeGetMatchesSorted(tourney.id);
    const players = await challongeGetPlayers(tourney.id);
    let currentMatchIndex = 0;
    // show previous day's results and close matches
    if (tourney.open) {
      interaction.editReply({
        content: "Last day's results:",
      });
      currentMatchIndex = await showPreviousResults(
        interaction,
        mendicant,
        matches,
        players,
        tourney.id,
        tourney
      );
      // get the matches again to get the updated state
      sleep(2000);
      matches = await challongeGetMatchesSorted(tourney.id);
    } else {
      interaction.editReply({
        content: "Next matches:",
      });
    }

    // show next matches
    await showNextMatches(
      interaction,
      tourney,
      currentMatchIndex,
      matches,
      players
    );
  },

  usage:
    "You can only use this command on tournaments YOU created. Use the name you gave your tournament when you used `/create-tourney`. Once this command is used the revealed matches are closed: give some time to your members to vote.",
};
