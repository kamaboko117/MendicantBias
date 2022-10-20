const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { Round } = require('../../schemas/round');
const { Match } = require ('../../schemas/match');
const Tournament = require('../../schemas/tournament');
const mongoose = require('mongoose');

maxMatches= 16

// export const generateId = (size = 32) => {
//     const bytesArray = new Uint8Array(size / 2)
  
//     window.crypto.getRandomValues(bytesArray) // search alternative to this 
//     return [...bytesArray]
//       .map((number) => number.toString(16).padStart(2, '0'))
//       .join('')
//   }

async function showResults(tournamentProfile, roundProfile, interaction){
    i = tournamentProfile.currentMatch - roundProfile.matches[0].matchId + 1;
    count = roundProfile.matches.length;
    count = count > maxMatches + i ? maxMatches + i : count;

    tournamentProfile.currentMatch += count - i;
    currentBracket = tournamentProfile.currentBracket
    currentLoser = tournamentProfile.currentLoser
    currentWinner = tournamentProfile.currentWinner
    await tournamentProfile.save().catch(console.error);
    var j = 0;
    componentArray = [];
    for (; i < count; i++){
        j++;
        matchProfile = roundProfile.matches[i];
        matchProfile.open = false;
        matchProfile.winner = !matchProfile.playerLeft || matchProfile.votesRight > matchProfile.votesLeft ?
            matchProfile.playerRight : matchProfile.playerLeft;
        matchProfile.loser = !matchProfile.playerLeft || matchProfile.votesRight > matchProfile.votesLeft ?
            matchProfile.playerLeft : matchProfile.playerRight;
        roundProfile.matches[i] = matchProfile;
        if (roundProfile.winnerBracket)
            tournamentProfile.winnerRounds[tournamentProfile.currentWinner] = roundProfile;
        else
            tournamentProfile.loserRounds[tournamentProfile.currentLoser] = roundProfile;
        await tournamentProfile.save().catch(console.error);
        if (matchProfile.playerLeft && matchProfile.playerRight){
            
            emote1 = roundProfile.matches[i].playerLeft.split(':')[2].slice(0, -1);
            emote2 = roundProfile.matches[i].playerRight.split(':')[2].slice(0, -1);

            const button1 = new ButtonBuilder()
            .setCustomId(`T ${tournamentProfile._id} ${currentBracket} ${currentBracket ? currentLoser : currentWinner} ${i} left`)
            .setStyle(ButtonStyle.Secondary)
            .setLabel(`[${matchProfile.votesLeft}]`)
            .setEmoji(emote1);
            
            const button2 = new ButtonBuilder()
            .setCustomId(`T ${tournamentProfile._id} ${currentBracket} ${currentBracket ? currentLoser : currentWinner} ${i} right`)
            .setStyle(ButtonStyle.Secondary)
            .setLabel(`[${matchProfile.votesRight}]`)
            .setEmoji(emote2);
            componentArray.push(new ActionRowBuilder().addComponents(button1, button2));
        
        }else{
            interaction.channel.send(`${i + 1} bye`)
        }
        if ((j === 5 || i + 1 === count) && componentArray.length){
            j = 0;
            interaction.channel.send({components: componentArray})
            componentArray = [];
        }
    }
    await tournamentProfile.save().catch(console.error);
}

async function  createLB1(tournamentProfile){
    for(i = 0; i < (roundProfile.numPlayers / 2); i++){
        matchProfile = new Match({
            _id: mongoose.Types.ObjectId(),
            matchId: i + 1 + tournamentProfile.currentMatch,
            playerLeft:
                tournamentProfile.winnerRounds[tournamentProfile.currentWinner].matches[i * 2].loser,
            playerRight:
                tournamentProfile.winnerRounds[0].matches[i * 2 + 1].loser,
            votesLeft: 0,
            votesRight: 0,
            open: true,
        })
        roundProfile.matches[i] = matchProfile;
    }
    tournamentProfile.currentBracket = 1;
    tournamentProfile.currentLoser++;
    tournamentProfile.loserRounds[tournamentProfile.currentLoser] = roundProfile;
    await tournamentProfile.save().catch(console.error);
}

async function  createLB2(tournamentProfile){
    const prevWB = tournamentProfile.winnerRounds[tournamentProfile.currentWinner];
    const prevLB = tournamentProfile.loserRounds[tournamentProfile.currentLoser];
    const j = prevLB.matches.length;
    
    for(i = 0; i < (roundProfile.numPlayers / 2); i++){
        matchProfile = new Match({
            _id: mongoose.Types.ObjectId(),
            matchId: i + 1 + tournamentProfile.currentMatch,
            playerLeft:
                prevWB.matches[j - i].loser,
            playerRight:
                prevLB.matches[i].winner,
            votesLeft: 0,
            votesRight: 0,
            open: true,
        })
        roundProfile.matches[i] = matchProfile;
    }
    tournamentProfile.currentBracket = 1;
    tournamentProfile.currentLoser++;
    tournamentProfile.loserRounds[tournamentProfile.currentLoser] = roundProfile;
    await tournamentProfile.save().catch(console.error);
}

async function  createLB4(tournamentProfile){
    const prevWB = tournamentProfile.winnerRounds[tournamentProfile.currentWinner];
    const prevLB = tournamentProfile.loserRounds[tournamentProfile.currentLoser];
    const j = prevLB.matches.length / 2;
    
    for(i = 0; i < (roundProfile.numPlayers / 2) / 2; i++){
        matchProfile = new Match({
            _id: mongoose.Types.ObjectId(),
            matchId: i + 1 + tournamentProfile.currentMatch,
            playerLeft:
                prevWB.matches[j - i].loser,
            playerRight:
                prevLB.matches[i].winner,
            votesLeft: 0,
            votesRight: 0,
            open: true,
        })
        roundProfile.matches[i] = matchProfile;
    }
    for(i = (roundProfile.numPlayers / 2) / 2; i < (roundProfile.numPlayers / 2); i++){
        matchProfile = new Match({
            _id: mongoose.Types.ObjectId(),
            matchId: i + 1 + tournamentProfile.currentMatch,
            playerLeft:
                prevWB.matches[(j * 2) - i].loser,
            playerRight:
                prevLB.matches[i].winner,
            votesLeft: 0,
            votesRight: 0,
            open: true,
        })
        roundProfile.matches[i] = matchProfile;
    }
    tournamentProfile.currentBracket = 1;
    tournamentProfile.currentLoser++;
    tournamentProfile.loserRounds[tournamentProfile.currentLoser] = roundProfile;
    await tournamentProfile.save().catch(console.error);
}

async function  createLB6(tournamentProfile){
    const prevWB = tournamentProfile.winnerRounds[tournamentProfile.currentWinner];
    const prevLB = tournamentProfile.loserRounds[tournamentProfile.currentLoser];
    const j = prevLB.matches.length / 2;
    
    for(i = 0; i < (roundProfile.numPlayers / 2) / 2; i++){
        matchProfile = new Match({
            _id: mongoose.Types.ObjectId(),
            matchId: i + 1 + tournamentProfile.currentMatch,
            playerLeft:
                prevWB.matches[j + i].loser,
            playerRight:
                prevLB.matches[i].winner,
            votesLeft: 0,
            votesRight: 0,
            open: true,
        })
        roundProfile.matches[i] = matchProfile;
    }
    for(i = (roundProfile.numPlayers / 2) / 2; i < (roundProfile.numPlayers / 2); i++){
        matchProfile = new Match({
            _id: mongoose.Types.ObjectId(),
            matchId: i + 1 + tournamentProfile.currentMatch,
            playerLeft:
                prevWB.matches[i - j].loser,
            playerRight:
                prevLB.matches[i].winner,
            votesLeft: 0,
            votesRight: 0,
            open: true,
        })
        roundProfile.matches[i] = matchProfile;
    }
    tournamentProfile.currentBracket = 1;
    tournamentProfile.currentLoser++;
    tournamentProfile.loserRounds[tournamentProfile.currentLoser] = roundProfile;
    await tournamentProfile.save().catch(console.error);
}

async function  createLB8(tournamentProfile){
    const prevWB = tournamentProfile.winnerRounds[tournamentProfile.currentWinner];
    const prevLB = tournamentProfile.loserRounds[tournamentProfile.currentLoser];
    
    for(i = 0; i < (roundProfile.numPlayers / 2); i++){
        matchProfile = new Match({
            _id: mongoose.Types.ObjectId(),
            matchId: i + 1 + tournamentProfile.currentMatch,
            playerLeft:
                prevWB.matches[i].loser,
            playerRight:
                prevLB.matches[i].winner,
            votesLeft: 0,
            votesRight: 0,
            open: true,
        })
        roundProfile.matches[i] = matchProfile;
    }
    tournamentProfile.currentBracket = 1;
    tournamentProfile.currentLoser++;
    tournamentProfile.loserRounds[tournamentProfile.currentLoser] = roundProfile;
    await tournamentProfile.save().catch(console.error);
}

async function newRound(tournamentProfile, client){
    //if previous round was winner bracket, next one has to be a loser
    if (roundProfile.winnerBracket){
        console.log(1)
        roundProfile = new Round({
            _id: mongoose.Types.ObjectId(),
            name: `LB${tournamentProfile.currentLoser + 1}`,        
            winnerBracket: false,
            // if this is the first loser bracket round, it should be minor
            minor: tournamentProfile.currentLoser ? false : true,
        })
        roundProfile.numPlayers = roundProfile.minor ?
            (tournamentProfile.currentLoser == 0 ?
                    tournamentProfile.winnerRounds[tournamentProfile.currentWinner].numPlayers / 2 :
                    tournamentProfile.loserRounds[tournamentProfile.currentLoser].numPlayers) :
            tournamentProfile.loserRounds[tournamentProfile.currentLoser].numPlayers;
        if (tournamentProfile.currentLoser + 1){
            await createLB1(tournamentProfile);
            return;
        }
        switch ((tournamentProfile.currentLoser + 1) % 8){
            case 0:
                await createLB8(tournamentProfile);
                break;
            case 2:
                await createLB2(tournamentProfile);
                break;
            case 4:
                await createLB4(tournamentProfile);
                break;
            case 6:
                await createLB6(tournamentProfile);
                break;
            
            default:
                await createLB2(tournamentProfile);
        }
    }
    
    //if previous round was a minor loser bracket, next one has to be a winner
    else if (roundProfile.minor){
        console.log(2)
        var RO = tournamentProfile.winnerRounds[tournamentProfile.currentWinner].matches.length;
        roundProfile = new Round({
            _id: mongoose.Types.ObjectId(),
            name: `RO${RO}`,
            numPlayers: RO,
            winnerBracket: true,
        })

        for(i = 0; i < (roundProfile.numPlayers / 2); i++){
            matchProfile = new Match({
                _id: mongoose.Types.ObjectId(),
                matchId: i + 1 + tournamentProfile.currentMatch,
                playerLeft: tournamentProfile.winnerRounds[tournamentProfile.currentWinner].matches[i * 2].winner,
                playerRight: tournamentProfile.winnerRounds[tournamentProfile.currentWinner].matches[i * 2 + 1].winner,
                votesLeft: 0,
                votesRight: 0,
                open: true,
           })
           roundProfile.matches[i] = matchProfile;
        }
        tournamentProfile.currentBracket = 0;
        tournamentProfile.currentWinner++;
        tournamentProfile.winnerRounds[tournamentProfile.currentWinner] = roundProfile;
        await tournamentProfile.save().catch(console.error);
    }

    //if previous round was a major loser bracket, next one is a minor LB except if
    // its the LB finals
    else if (roundProfile.numPlayers != 2){
        console.log(3)
        roundProfile = new Round({
            _id: mongoose.Types.ObjectId(),
            name: `LB${tournamentProfile.currentLoser + 1}`,
            numPlayers: tournamentProfile.loserRounds[tournamentProfile.currentLoser].numPlayers / 2,
            winnerBracket: false,
            minor: true,
        })
        for(i = 0; i < (roundProfile.numPlayers / 2); i++){
            matchProfile = new Match({
                _id: mongoose.Types.ObjectId(),
                matchId: i + 1 + tournamentProfile.currentMatch,
                playerLeft: tournamentProfile.winnerRounds[tournamentProfile.currentWinner].matches[i * 2].loser,
                playerRight: tournamentProfile.loserRounds[tournamentProfile.currentLoser].matches[i * 2 + 1].winner,
                votesLeft: 0,
                votesRight: 0,
                open: true,
           })
           roundProfile.matches[i] = matchProfile;
        }
        tournamentProfile.currentBracket = 1;
        tournamentProfile.currentLoser++;
        tournamentProfile.loserRounds[tournamentProfile.currentLoser] = roundProfile;
        await tournamentProfile.save().catch(console.error);
    }

    //grandFinals
    else{
        roundProfile = new Round({
            _id: mongoose.Types.ObjectId(),
            name: `GRAND FINALS`,
            numPlayers: 2,
            winnerBracket: true,
        })
        
        matchProfile = new Match({
            _id: mongoose.Types.ObjectId(),
            matchId: 1 + tournamentProfile.currentMatch,
            playerLeft: tournamentProfile.winnerRounds[tournamentProfile.currentWinner].matches[0].winner,
            playerRight: tournamentProfile.loserRounds[tournamentProfile.currentLoser].matches[0].winner,
            votesLeft: 0,
            votesRight: 0,
            open: true,
        })
        roundProfile.matches[0] = matchProfile;
        tournamentProfile.currentBracket = 0;
        tournamentProfile.currentWinner++;
        tournamentProfile.winnerRounds[tournamentProfile.currentWinner] = roundProfile;
        await tournamentProfile.save().catch(console.error);
    }
}
function printNextMatches(tournamentProfile, roundProfile, interaction){
    i = tournamentProfile.currentMatch - roundProfile.matches[0].matchId + 1;
    count = roundProfile.matches.length;
    count = count > maxMatches + i ? maxMatches + i : count;
    console.log(`i: ${i}, count: ${count}`);
    var j = 0;
    componentArray = [];
    for (; i < count; i++)
    {   
        j++;
        matchProfile = roundProfile.matches[i];
        console.log(matchProfile.playerLeft);
        console.log(matchProfile.playerRight);
        if (matchProfile.playerLeft && matchProfile.playerRight){
            
            emote1 = roundProfile.matches[i].playerLeft.split(':')[2].slice(0, -1);
            emote2 = roundProfile.matches[i].playerRight.split(':')[2].slice(0, -1);

            console.log(emote1);
            const button1 = new ButtonBuilder()
            .setCustomId(`T ${tournamentProfile._id} ${tournamentProfile.currentBracket} ${tournamentProfile.currentBracket ? tournamentProfile.currentLoser : tournamentProfile.currentWinner} ${i} left`)
            .setStyle(ButtonStyle.Secondary)
            .setEmoji(emote1);
            
            const button2 = new ButtonBuilder()
            
            .setCustomId(`T ${tournamentProfile._id} ${tournamentProfile.currentBracket} ${tournamentProfile.currentBracket ? tournamentProfile.currentLoser : tournamentProfile.currentWinner} ${i} right`)
            .setStyle(ButtonStyle.Secondary)
            .setEmoji(emote2);
            componentArray.push(new ActionRowBuilder().addComponents(button1, button2));
            
        }else{
            interaction.channel.send(`${i + 1} bye`)
        }
        console.log(`i: ${i}`);
        if ((j === 5 || i + 1 === count) && componentArray.length){
            j = 0;
            interaction.channel.send({components: componentArray})
            componentArray = [];
        }
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tourney_next')
        .setDescription('post next matches for tournament')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('tournament name')
                .setRequired(true)
            ),
    async execute(interaction, client) {
        const option1 = interaction.options.getString('name');
        
        tournamentProfile = await Tournament.findOne({name: option1, host: interaction.member.toString()});
        if (!tournamentProfile){
            await interaction.reply({
                content: `Error: You are not this tournament's host. Did you type the name correctly?`
            });
            return;
        }
        
        roundProfile = tournamentProfile.currentBracket ?
            tournamentProfile.loserRounds[tournamentProfile.currentLoser] :
            tournamentProfile.winnerRounds[tournamentProfile.currentWinner]

        if (!tournamentProfile.open){
            tournamentProfile.open = true;
            await tournamentProfile.save().catch(console.error);
            await interaction.reply({
                content: `${roundProfile.name}: `
            });
        }else{
            //show previous day's results and close matches
            await interaction.reply({
                content: "last day's results:"
            });
            await showResults(tournamentProfile, roundProfile, interaction);
            interaction.channel.send(`next matches:`)
        }

        //if grandfinals
        if (roundProfile.name == 'GRAND FINALS'){

        }
        //if round is over and its not grandfinals
        else if (tournamentProfile.currentMatch == roundProfile.matches.length + roundProfile.matches[0].matchId - 1){
            await newRound(tournamentProfile, client);
            interaction.channel.send(`${roundProfile.name}: `);
        }
        
        //print next Matches
        printNextMatches(tournamentProfile, roundProfile, interaction);
        
    }
}