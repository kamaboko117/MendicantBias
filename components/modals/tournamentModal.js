module.exports = {
    data: {
        name: 'tournament-form'
    },
    async execute(interaction, client){
        await interaction.reply({
            content: 'created tournament'
        })
    }
}