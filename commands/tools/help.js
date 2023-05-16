import { SlashCommandBuilder, EmbedBuilder } from "@discordjs/builders";
import commands from "../../commands/index.js";

function listCommands(interaction, client) {
  console.log(`${interaction.member.displayName} used /help`);

  let i = 0;
  let fields = [];
  Object.keys(commands).forEach((key) => {
    const group = commands[key];
    fields[i] = new Object();
    fields[i].name = `${key}`;
    fields[i].value = "";
    let j = 0;
    Object.keys(group).forEach((key) => {
      const command = group[key];
      fields[i].value += `${j ? ", " : " "}\`${command.data.name}\``;
      j = 1;
    });
    i++;
  });

  const embed = new EmbedBuilder()
    .setTitle(`Command list`)
    .setDescription(
      "use /<command> for more detailed help on a specific command"
    )
    .setColor(client.color)
    .addFields(fields);
  return interaction.reply({
    embeds: [embed],
  });
}

function searchCommand(cmd) {
  let found = null;
  Object.keys(commands).forEach((key) => {
    const group = commands[key];
    Object.keys(group).forEach((key) => {
      const command = group[key];
      if (command.data.name === cmd) {
        found = command;
        return;
      }
    });
    if (found) return;
  });
  return found;
}

export default {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Lists all available commands")
    .addStringOption((option) =>
      option
        .setName("command")
        .setDescription("Shows help for a specific command")
        .setRequired(false)
    ),
  async execute(interaction, client) {
    const option1 = interaction.options.getString("command");

    if (!option1) {
      return listCommands(interaction, client);
    }
    const command = searchCommand(option1);
    if (!command) {
      interaction.reply(`command ${option1} does not exist`);
      return;
    }

    let embed;
    if (command.usage) {
      let field = new Object();
      field.name = "Usage";
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
        .setDescription(command.data.description);
    }

    return interaction.reply({
      embeds: [embed],
    });
  },

  usage: "? my brother in christ you litterally just used the command",
};
