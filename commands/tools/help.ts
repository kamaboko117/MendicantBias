import { SlashCommandBuilder, EmbedBuilder } from "@discordjs/builders";
import commands from "../index";
import GuildCommandInteraction from "../../classes/GuildCommandInteraction.js";
import { Mendicant } from "../../classes/Mendicant.js";
import { Command } from "../../types/Command.js";
import { APIEmbedField } from "discord.js";

function listCommands(interaction: GuildCommandInteraction, mendicant: Mendicant) {
  console.log(`${interaction.member.displayName} used /help`);

  let i = 0;
  let fields : APIEmbedField[] = [];
  Object.keys(commands).forEach((key) => {
    const group = commands[key as keyof typeof commands];
    fields[i] = new Object() as APIEmbedField;
    fields[i].name = `${key}`;
    fields[i].value = "";
    let j = 0;
    Object.keys(group).forEach((key) => {
      const command = group[key as keyof typeof group] as Command;
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
    .setColor(mendicant.color)
    .addFields(fields);
  return interaction.reply({
    embeds: [embed],
  });
}

function searchCommand(cmd: string) : Command | null {
  let found: Command | null = null;
  Object.keys(commands).forEach((key) => {
    const group = commands[key as keyof typeof commands];
    Object.keys(group).forEach((key) => {
      const command: Command = group[key as keyof typeof group];
      if (command.data.name === cmd) {
        found = command;
        return found;
      }
    });
    if (found) return found;
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
  async execute(interaction: GuildCommandInteraction, mendicant: Mendicant) {
    const option1 = interaction.options.getString("command");

    if (!option1) {
      return listCommands(interaction, mendicant);
    }
    const command = searchCommand(option1);
    if (!command) {
      interaction.reply(`command ${option1} does not exist`);
      return;
    }

    let embed;
    if (command.usage) {
      let field = new Object() as APIEmbedField;
      field.name = "Usage";
      field.value = command.usage;
      embed = new EmbedBuilder()
        .setTitle(option1)
        .setColor(mendicant.color)
        .setDescription(command.data.description)
        .addFields(field);
    } else {
      embed = new EmbedBuilder()
        .setTitle(option1)
        .setColor(mendicant.color)
        .setDescription(command.data.description);
    }

    return interaction.reply({
      embeds: [embed],
    });
  },

  usage: "? my brother in christ you litterally just used the command",
};
