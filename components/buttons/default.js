module.exports = {
    data: {
        name: 'default'
    },
    async execute(interaction, client) {
        await interaction.reply({
            content: 'no code for this button'
        })
    }
}