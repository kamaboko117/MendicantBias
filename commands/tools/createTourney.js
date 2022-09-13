const { SlashCommandBuilder } = require('discord.js');
const Tournament = require('../../schemas/tournament');
const Round = require('../../schemas/round');
const { Match } = require ('../../schemas/match');
const mongoose = require('mongoose');

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

module.exports = {
    data: new SlashCommandBuilder()
        .setName('createtourney')
        .setDescription('creates an emotedokai tournament')
        .addStringOption(option =>
            option.setName('name')
                .setDescription(`the tournament's name`)
                .setRequired(true)
            ),
    
        async execute(interaction, client) {
            await interaction.reply({
                content: "pouet"
            });
            const option1 = interaction.options.getString('emote1')
            //create Tourney Profile
            tourneyProfile = new Tournament({
                _id: mongoose.Types.ObjectId(),
                name: option1,
            });
            for (const emoji of client.emojis.cache){
                tourneyProfile.players.push(emoji.toString().split(',')[1]);
            }
            let bracketSize = 2;
            for (i = 1; bracketSize < tourneyProfile.players.length; i++)
                bracketSize = Math.pow(2, i);
            tourneyProfile.playerCount = bracketSize;
            
            //create first round
            roundProfile = new Round({
                _id: mongoose.Types.ObjectId(),
                name: `Ro${tourneyProfile.playerCount}`,
                numPlayers: tourneyProfile.playerCount,
                winnerBraket: true
            })
            const seeds = seeding(tourneyProfile.playerCount);
            for(i = 0; i < tourneyProfile.playerCount / 2; i++){
                matchProfile = new Match({
                    _id: mongoose.Types.ObjectId(),
                    matchId: i + 1,
                    playerLeft: tourneyProfile.players[seeds[i * 2]],
                    playerRight: tourneyProfile.players[seeds[i * 2 + 1]],
                    votesLeft: 0,
                    votesRight: 0,
                    open: true,
               })
               matchProfile.save().catch(console.error);
               client.count++
               roundProfile.matches[i] = matchProfile;
            }
            roundProfile.save().catch(console.error);
            tourneyProfile.winnerRounds[0] = roundProfile;
            //save tourney
            await tourneyProfile.save().catch(console.error);
            
            //log
            console.log("tournament created");
    }
}