module.exports = {
    data: {
        name: 'autorole'
    },
    async execute(interaction, client) {
        let role = interaction.member.guild.roles.cache.find(role => role.name === "emotedokai")
        await interaction.member.roles.add(role)

        await interaction.reply({
            content: 'Done',
            ephemeral: true
        })
    }
}