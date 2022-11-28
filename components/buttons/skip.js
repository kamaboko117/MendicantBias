const { getVoiceConnection } = require("@discordjs/voice");
const { getQueueMessage } = require("../../commands/music/queue");

module.exports = {
    data: {
        name: "skip",
    },
    async execute(interaction, client) {
        console.log(`${interaction.member.displayName} used skip button`);
        const idsplit = interaction.component.customId.split(" ");
        const index = Number(idsplit[1]);

        const { voice } = interaction.member;
        if (!voice.channelId) {
            interaction.reply("Error: You are not in a voice channel");
            return;
        }
        const connection = getVoiceConnection(interaction.guild.id);
        if (!connection) {
            await interaction.reply({
                content: "Nothing to skip",
            });
            return;
        }

        let subscription = connection.state.subscription;
        let player = subscription.player;

        //player's event listener on idle will play next resource automatically
        player.stop();

        let queue = client.queues.find(
            (queue) => queue.id === interaction.guild.id
        );
        if (queue) queue = queue.queue;
        if (!queue || queue.isEmpty) {
            await interaction.update({
                content: "Queue is empty",
                ephemeral: false,
            });
            return;
        }

        setTimeout(() => {
            let message = getQueueMessage(queue, index, client);
            interaction.update(message);
        }, 1_000);
    },
};
