const { mendicantPlay } = require("../../commands/music/play")
const ytdl = require('ytdl-core');

module.exports = {
    data: {
        name: 'play'
    },
    async execute(interaction, client) {
        let idsplit = interaction.component.customId.split(' '); 
        let option1 = idsplit[1]
        let title = idsplit[3]
        let i = 3;
        while (idsplit[i]){
            title += ` ${idsplit[i]}`;
            i++;
        }
        let stream = ytdl(option1, { filter: 'audioonly' }).on('error', (err) =>
            interaction.channel.send(`ytdl Module: ${err}`))
            
        return mendicantPlay(interaction, stream, client, title);
    }
}