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

async function    createTourney(name, guild, client, interaction){
    tourneyProfile = new Tournament({
        _id: mongoose.Types.ObjectId(),
        name: name,
        host: interaction.member.toString(),
        currentMatch: 0,
        open: false
    });
    i = 0;
    memberArray = [];
    console.log(`guild: ${guild}`)
    await guild.members.fetch();
    for (const member of guild.members.cache){
        console.log(`member: ${member} size: ${guild.members.cache.size}`);
        memberArray.push(member.toString().split(',')[1]);
        i++;
    }

    tourneyProfile.players = memberArray.sort(() => Math.random() - 0.5);
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
        name: 'memberdokai-form'
    },
    async execute(interaction, client){
        const   name = interaction.fields.getTextInputValue('tournamentName');
        const   guild = interaction.guild;


        await createTourney(name, guild, client, interaction);

        await interaction.reply({
            content: 'created tournament'
        })
    }
}