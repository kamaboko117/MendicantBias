import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import commandsList from "../../commands/index.js";

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
    const rest = new REST({ version: "9" }).setToken(process.env.TOKEN);
    try {
      console.log("Started refreshing apllication (/) commands.");
      await rest.put(Routes.applicationCommands(clientId), {
        body: client.commandArray,
      });
      console.log("Successfully reloaded application (/) commands.");
    } catch (error) {
      console.error(error);
    }
  };
};
