const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require('fs');

module.exports = (client) => {
    client.handleCommands = async () => {
        const commandFolders = fs.readdirSync('./commands');
        for (const folder of commandFolders) {
            const commandFiles = fs.readdirSync(`./commands/${folder}`).filter((file) => file.endsWith(".js"));
            const { commands, commandArray } = client;
            for (const file of commandFiles){
                const command = require(`../../commands/${folder}/${file}`);
                commands.set(command.data.name, command);
                commandArray.push(command.data.toJSON())
            }
        }
        const clientId = '688035147559337994';
        const guildId = '242387331787522048';
        const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);
        try {
            console.log('Started refreshing apllication (/) commands.');
            await rest.put(Routes.applicationCommands(clientId), {
                body: client.commandArray,
            });
            console.log('Successfully reloaded application (/) commands.')
        } catch (error) {
            console.error(error);
        }
    }
}