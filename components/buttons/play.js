const {
    mendicantPlay,
    mendicantCreateItem,
} = require("../../commands/music/play");

module.exports = {
    data: {
        name: "play",
    },
    async execute(interaction, client) {
        let idsplit = interaction.component.customId.split(" ");
        let option1 = idsplit[1];
        let item = await mendicantCreateItem(interaction, option1);
        if (!item) {
            interaction.channel.send("Error: Could not create item (3)");
            return;
        }
        return mendicantPlay(interaction, item, client);
    },
};
