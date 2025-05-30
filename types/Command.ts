import type { SlashCommandBuilder } from "@discordjs/builders";
import type { Interaction } from "discord.js";
import type { Mendicant } from "../classes/Mendicant";

export interface Command {
  data: SlashCommandBuilder;
  execute: (interaction: Interaction, mendicant: Mendicant) => Promise<void>;
  usage?: string;
}
