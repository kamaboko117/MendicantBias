const fs = require('fs');
const { SlashCommandBuilder, EmbedBuilder } = require('@discordjs/builders');

function listCommands(interaction, client){
    const commandFolders = fs.readdirSync('./commands');
    let i = 0;
    let fields = [];
    for (const folder of commandFolders) {
        const commandFiles = fs.readdirSync(`./commands/${folder}`).filter((file) => file.endsWith(".js"));
        fields[i] = new Object;
        fields[i].name = `${folder}`; 
        fields[i].value = '';
        let j = 0;
        for (const file of commandFiles) {
            const command = require(`../../commands/${folder}/${file}`);
            fields[i].value += `${(j ? ', ' : " ")}\`${command.data.name}\``;
            j = 1;
        }
        i++;
    }

    const embed = new EmbedBuilder()
    .setTitle(`Command list`)
    .setDescription('use /<command> for more detailed help on a specific command')
    .setColor(client.color)
    .addFields(fields)
    return interaction.reply({
        embeds: [embed]
    });
}

function    searchCommand(cmd){
    const commandFolders = fs.readdirSync('./commands');
    for (const folder of commandFolders) {
        const commandFiles = fs.readdirSync(`./commands/${folder}`).filter((file) => file.endsWith(".js"));

        for (const file of commandFiles) {
            const command = require(`../../commands/${folder}/${file}`);
            if (command.data.name === cmd)
                return (command);
        }
    }
    return (null);
}

module.exports = {
    data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Lists all available commands')
    .addStringOption(option =>
        option.setName('command')
            .setDescription('Shows help for a specific command')
            .setRequired(false)
        ),
    async execute(interaction, client) {
        const option1 = interaction.options.getString('command');
        
        if (!option1)
            return (listCommands(interaction, client));
        const command = searchCommand(option1);
        if (!command){
            interaction.reply(`command ${option1} does not exist`)
            return;
        }
        
        if (command.usage){
            let field = new Object();
            field.name = 'Usage';
            field.value = command.usage;
            embed = new EmbedBuilder()
            .setTitle(option1)
            .setColor(client.color)
            .setDescription(command.data.description)
            .addFields(field);
        } else {
            embed = new EmbedBuilder()
            .setTitle(option1)
            .setColor(client.color)
            .setDescription(command.data.description)
        }
        
        return interaction.reply({
            embeds: [embed]
        });
    },

    usage: "? my brother in christ you litterally just used the command"
};