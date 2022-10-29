const { mendicantPlay, mendicantCreateResource } = require("../../commands/music/play")

module.exports = {
    data: {
        name: 'play'
    },
    async execute(interaction, client) {
        let idsplit = interaction.component.customId.split(' '); 
        let option1 = idsplit[1]
        let resource = await mendicantCreateResource(interaction, option1)
        if (!resource){
            interaction.channel.send('Error: Could not create resource')
            return ;
        }
        return mendicantPlay(interaction, resource, client);
    }
}