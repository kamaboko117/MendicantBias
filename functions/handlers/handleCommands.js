import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import commandsList from "../../commands/index.js";
import privateCommandsList from "../../commands/private/index.js";
const devGuildId = "708111231789301891";

export default (client) => {
  client.handleCommands = async () => {
    Object.keys(commandsList).forEach((key) => {
      const commandGroup = commandsList[key];
      Object.keys(commandGroup).forEach((key) => {
        const command = commandGroup[key];
        client.commands.set(command.data.name, command);
        client.commandArray.push(command.data.toJSON());
      })
    });
    const clientId = client.user.id;
    const rest = new REST({ version: "9" }).setToken(process.env.TOKEN2);
    try {
      console.log("Started refreshing apllication (/) commands.");
      await rest.put(Routes.applicationCommands(clientId), {
        body: client.commandArray,
      });
      console.log("Successfully reloaded application (/) commands.");
    } catch (error) {
      console.error(error);
    }
    Object.keys(privateCommandsList).forEach((key) => {
      const command = privateCommandsList[key];
      client.commands.set(command.data.name, command);
    });
    let privateCommandArray = [];
    Object.keys(privateCommandsList).forEach((key) => {
      const command = privateCommandsList[key];
      privateCommandArray.push(command.data.toJSON());
    });
    try {
      console.log("Started refreshing private apllication (/) commands.");
      await rest.put(Routes.applicationGuildCommands(clientId, devGuildId), {
        body: privateCommandArray,
      });
      console.log("Successfully reloaded private application (/) commands.");
    } catch (error) {
      console.error(error);
    }
  };
};
