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
        .setDescription('Reveals a match result and closes the match')
        .addStringOption(option =>
            option.setName('match_id')
                .setDescription('the ID of the match you want to reveal')
                .setRequired(true)
            ),

    async execute(interaction, client) {
        console.log(`${interaction.member.displayName} used /reveal`)
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
                    content: `Match does not exist in database: Probably deleted`,
                });
            }
            matchProfile.open = false;
            matchProfile.winner = matchProfile.votesRight > matchProfile.votesLeft ? matchProfile.playerRight : matchProfile.playerLeft;
            await matchProfile.save().catch(console.error); 
        
        const customEmote1 = matchProfile.playerLeft.split(':')[2];
        const customEmote2 = matchProfile.playerRight.split(':')[2];

        const emote1 = customEmote1 ? customEmote1.slice(0, -1) : matchProfile.playerLeft;
        const emote2 = customEmote1 ? customEmote2.slice(0, -1) : matchProfile.playerRight;

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

    usage: 'Use the match ID given at match creation. **A closed match can no longer receive votes**'
};