const {
    SlashCommandBuilder,
    SelectMenuBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    SelectMenuOptionBuilder
} = require('discord.js');

const testMenu = require('../../components/selectMenus/revealMenu');
const { Match } = require ('../../schemas/match');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reveal')
        .setDescription('reveals a match result and closes the match')
        .addStringOption(option =>
            option.setName('match_id')
                .setDescription('the id for the match you want to reveal')
                .setRequired(false)
            ),

    async execute(interaction, client) {
        console.log(`${interaction.member.displayName} used reveal`)
        options = interaction.options.getString('match_id');
        // if (options){
            if (isNaN(options))
            {
                await interaction.reply({
                    content: `Error: ID should be a number`,
                });
                return ;
            }
            matchProfile = await Match.findOne({matchId: options});
            if (!matchProfile){
                await interaction.reply({
                    content: `match does not exist in database: Probably deleted`,
                });
            }
            matchProfile.open = false;
            matchProfile.winner = matchProfile.votesRight > matchProfile.votesLeft ? matchProfile.playerRight : matchProfile.playerLeft;
            await matchProfile.save().catch(console.error); 
            // return ;
        // }
        // options = [];
        // const count = client.matchCount;
        // if (!count){
        //     await interaction.reply({
        //         content: "no matches"
        //     });
        //     return ;
        // }
        // for (i = 0; i < count; i++){
        //     matchProfile = await Match.findOne({matchId: i + 1});
        //     options[i] = {
        //         label: "match ID: " + matchProfile.matchId,
        //         // value: matchProfile.playerLeft + " vs " + matchProfile.playerRight + " " + i
        //         value: `` + matchProfile.matchId
        //     };
        // }
        // const menu = new SelectMenuBuilder()
        //     .setCustomId('revealMenu')
        //     .setMinValues(1)
        //     .setMaxValues(1)
        //     .addOptions(options);
        
        const emote1 = matchProfile.playerLeft.split(':')[2].slice(0, -1);
        const emote2 = matchProfile.playerRight.split(':')[2].slice(0, -1);

        const button1 = new ButtonBuilder()
            .setCustomId(matchProfile._id + ' left')
            .setStyle(ButtonStyle.Secondary)
            .setLabel(`[${matchProfile.votesLeft}]`)
            .setEmoji(emote1);
            
        const button2 = new ButtonBuilder()
            .setCustomId(matchProfile._id + ' right')
            .setStyle(ButtonStyle.Secondary)
            .setLabel(`[${matchProfile.votesRight}]`)
            .setEmoji(emote2);

        await interaction.reply({
            content: `${interaction.member} match results:\n${matchProfile.playerLeft} ${matchProfile.votesLeft} | ${matchProfile.votesRight} ${matchProfile.playerRight}\n${matchProfile.winner} wins !`,
            components: [new ActionRowBuilder().addComponents(button1, button2)]
        });
    },
};