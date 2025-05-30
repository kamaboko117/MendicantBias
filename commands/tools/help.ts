import { EmbedBuilder, SlashCommandBuilder } from "@discordjs/builders";
import type { APIEmbedField } from "discord.js";
import type GuildCommandInteraction from "../../classes/GuildCommandInteraction.js";
import type { Mendicant } from "../../classes/Mendicant.js";
import type { Command } from "../../types/Command.js";
import commands from "../index";

function listCommands(
  interaction: GuildCommandInteraction,
  mendicant: Mendicant
) {
  mendicant.logInteraction(interaction);

  const fields: APIEmbedField[] = Object.keys(commands).map((key) => {
    const group = commands[key as keyof typeof commands];
    const field: APIEmbedField = {
      name: `${key}`,
      value: Object.keys(group)
        .map(
          (key) =>
            `\`${(group[key as keyof typeof group] as Command).data.name}\``
        )
        .join(", "),
    };
    return field;
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

function searchCommand(cmd: string): Command | null {
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

    const embed = new EmbedBuilder()
      .setTitle(option1)
      .setColor(mendicant.color)
      .setDescription(command.data.description);

    if (command.usage) {
      const field: APIEmbedField = {
        name: "Usage",
        value: command.usage,
      };
      embed.addFields(field);
    }

    return interaction.reply({
      embeds: [embed],
    });
  },

  usage: "? my brother in christ you literally just used the command",
};
