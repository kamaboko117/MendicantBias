const { SlashCommandBuilder } = require("discord.js");
const { getVoiceConnection } = require("@discordjs/voice");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("move")
        .setDescription("Change an item's position in the queue")
        .addIntegerOption((option) =>
            option
                .setName("from")
                .setDescription("the item's current index")
                .setRequired(true)
        )
        .addIntegerOption((option) =>
            option
                .setName("to")
                .setDescription("the item's destination index")
                .setRequired(false)
        ),

    async execute(interaction, client) {
        const option1 = interaction.options.getInteger("from");
        let option2 = interaction.options.getInteger("to");

        if (!option2 || option2 < 1) {
            option2 = 1;
        }
        console.log(
            `${interaction.member.displayName} used /move ${option1} ${option2}`
        );

        const { voice } = interaction.member;
        if (!voice.channelId) {
            interaction.reply("Error: You are not in a voice channel");
            return;
        }
        const connection = getVoiceConnection(interaction.guild.id);
        if (!connection) {
            await interaction.reply({
                content: "Nothing to move",
            });
            return;
        }

        let queue = client.queues.find(
            (queue) => queue.id === interaction.guild.id
        );
        if (queue) {
            queue = queue.queue;
        }
        if (option2 > queue.length) {
            option2 = queue.length;
        }

        let tmpArray = [];
        tmpArray.push(queue.peek());
        for (let i = queue.head + 1; i < queue.tail; i++) {
            if (i === option2 + queue.head) {
                let element = queue.elements[option1 + queue.head];
                if (!element) {
                    continue;
                }
                tmpArray.push(element);
            } else if (i === option1 + queue.head) {
                continue;
            } else {
                tmpArray.push(queue.elements[i]);
            }
        }

        while (!queue.isEmpty) {
            queue.dequeue();
        }
        for (const item of tmpArray) {
            queue.enqueue(item);
        }
        await interaction.reply({
            content: "Done",
        });
    },

    usage: "",
};
