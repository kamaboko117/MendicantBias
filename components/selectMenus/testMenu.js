module.exports = {
    data: {
        name: `testMenu`
    },
    async execute (interaction, client) {
        await interaction.reply({
            content: `you select: ${interaction.values[0]}`,
        });
    },
};