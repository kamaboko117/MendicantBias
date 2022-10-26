const { mendicantPlay } = require("../../commands/music/play")
const ytdl = require('ytdl-core');

module.exports = {
    data: {
        name: 'play'
    },
    async execute(interaction, client) {
        let option1 = interaction.component.customId.split(' ')[1]
        let stream = ytdl(option1, { filter: 'audioonly' }).on('error', (err) =>
            interaction.channel.send(`ytdl module error: ${err}`))
            
        return mendicantPlay(interaction, stream);
    }
}