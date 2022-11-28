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
                    let item = await mendicantCreateItem(
                        interaction,
                        video.id,
                        videoDetails
                    );
                    if (!item) {
                        interaction.channel.send("Error: Could not create item (2)");
                        continue;
                    }
                    mendicantPlay(interaction, item, client, true);
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
