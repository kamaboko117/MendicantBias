import { Guild, ModalSubmitInteraction } from "discord.js";
import mongoose from "mongoose";
import { Mendicant } from "../../classes/Mendicant.js";
import ChallongeTournament from "../../schemas/challongeTournament";
import Match from "../../schemas/match";
import Round from "../../schemas/round";
import Tournament from "../../schemas/tournament";
const challongeAPI = `https://api.challonge.com/v1/`;
const challongeAPIKey = process.env.CHALLONGE_KEY;

function seeding(numPlayers: number) {
  var rounds = Math.log(numPlayers) / Math.log(2) - 1;
  var pls = [1, 2];
  for (var i = 0; i < rounds; i++) {
    pls = nextLayer(pls);
  }
  return pls;
  function nextLayer(pls: number[]) {
    var out: number[] = [];
    var length = pls.length * 2 + 1;
    pls.forEach(function (d) {
      out.push(d);
      out.push(length - d);
    });
    return out;
  }
}

const getEmojiIDArrayFromGuilds = async (guilds: Guild[]) => {
  let emojiArray = [];
  for (const guild of guilds) {
    for await (const emoji of guild.emojis.cache) {
      if (!emoji[1].managed) {
        emojiArray.push(emoji.toString().split(",")[1]);
      }
    }
  }
  return emojiArray;
};

const getEmojiArrayFromGuilds = async (guilds: Guild[]) => {
  let emojiArray: string[] = [];
  for (const guild of guilds) {
    for await (const emoji of guild.emojis.cache) {
      if (!emoji[1].managed) {
        // // if emoji is animated, add "animated" to the end of the emoji name
        // if (emoji[1].animated) {
        //   emojiArray.push(emoji[1].name! + " animated");
        // }
        // // if emoji name is already in the array, add the guild name to the end of the emoji name
        // if (emojiArray.includes(emoji[1].name!)) {
        //   emojiArray.push(emoji[1].name + " " + guild.name);
        // } else {
        //   emojiArray.push(emoji[1].name!);
        // }
        const emojiName = `${emoji[1].name!} | ${
          emoji.toString().split(",")[1]
        }`;
        emojiArray.push(emojiName);
      }
    }
  }
  return emojiArray;
};

async function createTourney(
  name: string,
  guilds: Guild[],
  mendicant: Mendicant,
  interaction: ModalSubmitInteraction
) {
  let tourneyProfile = new Tournament({
    _id: new mongoose.Types.ObjectId(),
    type: 0,
    name: name,
    host: interaction.member?.toString(),
    currentMatch: 0,
    open: false,
  });
  let i = 0;
  let emojiIDArray = await getEmojiIDArrayFromGuilds(guilds);
  tourneyProfile.players = emojiIDArray.sort(() => Math.random() - 0.5);
  let bracketSize = 2;
  for (i = 1; bracketSize < tourneyProfile.players.length; i++)
    bracketSize = Math.pow(2, i);
  tourneyProfile.playerCount = bracketSize;
  tourneyProfile.currentBracket = 0;
  tourneyProfile.currentWinner = 0;
  tourneyProfile.currentLoser = 0;

  //create first round
  let roundProfile = new Round({
    _id: new mongoose.Types.ObjectId(),
    name: `Ro${tourneyProfile.playerCount}`,
    numPlayers: tourneyProfile.playerCount,
    matches: [],
    winnerBracket: true,
  });
  const seeds = seeding(tourneyProfile.playerCount);
  for (i = 0; i < tourneyProfile.playerCount / 2; i++) {
    let matchProfile = new Match({
      _id: new mongoose.Types.ObjectId(),
      matchId: i + 1,
      playerLeft: tourneyProfile.players[seeds[i * 2] - 1],
      playerRight: tourneyProfile.players[seeds[i * 2 + 1] - 1],
      votesLeft: 0,
      votesRight: 0,
      open: true,
    });
    roundProfile.matches.push(matchProfile);
  }
  tourneyProfile.winnerRounds[0] = roundProfile;
  await tourneyProfile.save().catch(console.error);
}

const createTourneyChallonge = async (
  name: string,
  guilds: Guild[],
  interaction: ModalSubmitInteraction
) => {
  //create tournament
  const response1 = await fetch(
    `${challongeAPI}tournaments.json?api_key=${challongeAPIKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tournament: {
          name: name,
          tournament_type: "double elimination",
          grand_finals_modifier: "single match",
          show_rounds: true,
        },
      }),
    }
  );
  const data1 = await response1.json();
  console.log(data1.tournament);

  const challongeTournamentProfile = new ChallongeTournament({
    _id: new mongoose.Types.ObjectId(),
    id: data1.tournament.id,
    name: name,
    host: interaction.member?.toString(),
    open: false,
  });

  await challongeTournamentProfile.save().catch(console.error);

  //add participants
  const emojiArray = await getEmojiArrayFromGuilds(guilds);
  if (emojiArray.length > 256) {
    if (interaction.channel?.isSendable())
      interaction.channel?.send({
        content: `Warning: Challonge only supports 256 participants. Only the first 256 will be added.`,
      });
    emojiArray.splice(256);
  }
  console.log(data1);

  const response2 = await fetch(
    `${challongeAPI}tournaments/${data1.tournament.id}/participants/bulk_add.json?api_key=${challongeAPIKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        participants: emojiArray.map((emoji) => {
          return {
            name: emoji,
          };
        }),
      }),
    }
  );
  const data2 = await response2.json();
  console.log(data2);

  // suffle participants
  const response3 = await fetch(
    `${challongeAPI}tournaments/${data1.tournament.id}/participants/randomize.json?api_key=${challongeAPIKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  const data3 = await response3.json();
  console.log(data3);

  //start tournament
  const response4 = await fetch(
    `${challongeAPI}tournaments/${data1.tournament.id}/start.json?api_key=${challongeAPIKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  const data4 = await response4.json();
  console.log(data4);
  return data1.tournament.full_challonge_url;
};

export default {
  data: {
    name: "tournament-form",
  },
  async execute(interaction: ModalSubmitInteraction, mendicant: Mendicant) {
    await interaction.deferReply();
    const name = interaction.fields.getTextInputValue("tournamentName");
    const guilds = interaction.fields.getTextInputValue("guilds").split(" ");
    const challonge = interaction.fields.getTextInputValue("challonge");
    let guildArray = [];

    if (guilds.length > 3) {
      await interaction.editReply({
        content: `Error: Too many servers selected. Please select 3 or less`,
      });
      return;
    }
    for (const guildId of guilds) {
      let guild = mendicant.guilds.cache.find((guild) => guild.id === guildId);
      if (!guild) {
        await interaction.editReply({
          content: `Error: ${guildId} not found. I need to be a member of the guild to use the emojis. (/invite)`,
        });
        return;
      }
      guildArray.push(guild);
    }

    // await createTourney(name, guildArray, mendicant, interaction);
    if (challonge === "y") {
      const tournamentURL = await createTourneyChallonge(
        name,
        guildArray,
        interaction
      );
      await interaction.editReply({
        content: `created tournament: ${tournamentURL}\nuse **/challonge-tourney-next** to advance the tournament`,
      });
    } else {
      await createTourney(name, guildArray, mendicant, interaction);
      await interaction.editReply({
        content:
          "created tournament\nuse **/tourney-next** to advance the tournament",
      });
    }
  },
};
