const {
    mendicantPlay,
    mendicantCreateResource,
} = require("../../commands/music/play");
const youtubesearchapi = require("youtube-search-api");

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
                    let resource = await mendicantCreateResource(
                        interaction,
                        video.id
                    );
                    if (!resource) {
                        interaction.channel.send(
                            "Error: Could not create resource"
                        );
                        continue;
                    }
                    mendicantPlay(interaction, resource, client);
                }
            }
        });

        await interaction.reply({
            content: "Done",
            ephemeral: true,
        });
    },
};
