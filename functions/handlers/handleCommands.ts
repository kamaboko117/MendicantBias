import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import commandsList from "../../commands/index";
import privateCommandsList from "../../commands/private/index";
import { Mendicant } from "../../classes/Mendicant";
import { Command } from "../../types/Command";
const devGuildId = "708111231789301891";

export default (mendicant: Mendicant) => {
  mendicant.handleCommands = async () => {
    Object.keys(commandsList).forEach((key) => {
      const commandGroup = commandsList[key as keyof typeof commandsList];
      Object.keys(commandGroup).forEach((key) => {
        const command = commandGroup[key as keyof typeof commandGroup] as Command;
        mendicant.commands.set(command.data.name, command);
        mendicant.commandArray.push(command.data.toJSON());
      })
    });
    const clientId = mendicant.user?.id;
    const rest = new REST({ version: "9" }).setToken(process.env.TOKEN2 || "");
    try {
      console.log("Started refreshing apllication (/) commands.");
      await rest.put(Routes.applicationCommands(clientId || ""), {
        body: mendicant.commandArray,
      });
      console.log("Successfully reloaded application (/) commands.");
    } catch (error) {
      console.error(error);
    }
    Object.keys(privateCommandsList).forEach((key) => {
      const command = privateCommandsList[key as keyof typeof privateCommandsList];
      mendicant.commands.set(command.data.name, command);
    });
    let privateCommandArray: any[] = [];
    Object.keys(privateCommandsList).forEach((key) => {
      const command: any = privateCommandsList[key as keyof typeof privateCommandsList];
      privateCommandArray.push(command.data.toJSON());
    });
    try {
      console.log("Started refreshing private apllication (/) commands.");
      await rest.put(Routes.applicationGuildCommands(clientId || "", devGuildId), {
        body: privateCommandArray,
      });
      console.log("Successfully reloaded private application (/) commands.");
    } catch (error) {
      console.error(error);
    }
  };
};
