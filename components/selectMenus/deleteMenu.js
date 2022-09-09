Match = require ('../../schemas/match');

module.exports = {
    data: {
        name: `deleteMenu`
    },
    async execute (interaction, client) {
        await interaction.reply({
            content: `match deleted: ${interaction.values[0]}`,
        });
        await Match.deleteOne({matchId: interaction.values[0]});
        for (i = interaction.values[0] + 1; i < client.matchCount + 1; i++){
            matchProfile = await Match.findOne({matchId: i});
            matchProfile.matchId--;
            matchProfile.save().catch(console.error);
        }
        client.matchCount--;
    },
};