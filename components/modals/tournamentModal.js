const mongoose = require('mongoose');
const Tournament = require('../../schemas/tournament');
const { Round } = require('../../schemas/round');
const { Match } = require ('../../schemas/match');

function seeding(numPlayers){
    var rounds = Math.log(numPlayers)/Math.log(2)-1;
    var pls = [1,2];
    for(var i=0;i<rounds;i++){
      pls = nextLayer(pls);
    }
    return pls;
    function nextLayer(pls){
      var out=[];
      var length = pls.length*2+1;
      pls.forEach(function(d){
        out.push(d);
        out.push(length-d);
      });
      return out;
    }
}

async function    createTourney(name, guilds, client, interaction){
    tourneyProfile = new Tournament({
        _id: mongoose.Types.ObjectId(),
        type: 0,
        name: name,
        host: interaction.member.toString(),
        currentMatch: 0,
        open: false
    });
    i = 0;
    emojiArray = [];
    for (const guild of guilds){
        for (const emoji of guild.emojis.cache){
            if (!emoji.managed){
                emojiArray.push(emoji.toString().split(',')[1]);
                i++;
            }
        }
    }
    tourneyProfile.players = emojiArray.sort(() => Math.random() - 0.5);
    let bracketSize = 2;
    for (i = 1; bracketSize < tourneyProfile.players.length; i++)
        bracketSize = Math.pow(2, i);
    tourneyProfile.playerCount = bracketSize;
    tourneyProfile.currentBracket = 0;
    tourneyProfile.currentWinner = 0;
    tourneyProfile.currentLoser = 0

    //create first round
    roundProfile = new Round({
        _id: mongoose.Types.ObjectId(),
        name: `Ro${tourneyProfile.playerCount}`,
        numPlayers: tourneyProfile.playerCount,
        winnerBracket: true
    })
    const seeds = seeding(tourneyProfile.playerCount);
    for(i = 0; i < tourneyProfile.playerCount / 2; i++){
        matchProfile = new Match({
            _id: mongoose.Types.ObjectId(),
            matchId: i + 1,
            playerLeft: tourneyProfile.players[seeds[i * 2] - 1],
            playerRight: tourneyProfile.players[seeds[i * 2 + 1] - 1],
            votesLeft: 0,
            votesRight: 0,
            open: true,
       })
       roundProfile.matches[i] = matchProfile;
    }
    tourneyProfile.winnerRounds[0] = roundProfile;
    await tourneyProfile.save().catch(console.error);
}

module.exports = {
    data: {
        name: 'tournament-form'
    },
    async execute(interaction, client){
        const   name = interaction.fields.getTextInputValue('tournamentName');
        const   guilds = interaction.fields.getTextInputValue('guilds').split(' ');
        let     guildArray = [];

        if (guilds.length > 3){
            await interaction.reply({
                content: `Error: Too many servers selected. Please select 3 or less`
            })
            return ;
        }
        for (const guildId of guilds){
            let guild = client.guilds.cache.find(guild => guild.id === guildId)
            if (!guild){
                await interaction.reply({
                    content: `Error: ${guildId} not found. I need to be a member of the guild to use the emojis. (/invite)`
                })
                return;
            }
            guildArray.push(guild);
        }

        await createTourney(name, guildArray, client, interaction);

        await interaction.reply({
            content: 'created tournament'
        })
    }
}