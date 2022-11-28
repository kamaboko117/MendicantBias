const {
    mendicantPlay,
    mendicantCreateItem,
} = require("../../commands/music/play");
const youtubesearchapi = require("youtube-search-api");

function toSeconds(str) {
    return str.split(":").reduce(function (seconds, v) {
        return +v + seconds * 60;
    }, 0);
}

module.exports = {
    data: {
        name: "acceptplaylist",
    },
    async execute(interaction, client) {
        let idsplit = interaction.component.customId.split(" ");
        let index = idsplit[2];
        youtubesearchapi.GetPlaylistData(idsplit[1]).then(async (playlist) => {
            let i = 0;
            for (const video of playlist.items) {
                if (i < index) i++;
                else {
                    let videoDetails = new Object();
                    videoDetails.id = video.id;
                    videoDetails.title = video.title;
                    videoDetails.length = toSeconds(video.length.simpleText);
                    mendicantPlay(interaction, videoDetails, client, true);
                }
                // if (i - index > 30)
                //     break ;
            }
        });

        await interaction.reply({
            content: "Done",
            ephemeral: true,
        });
    },
};
