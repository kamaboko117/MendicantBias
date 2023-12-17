import { Mendicant } from "../classes/Mendicant";
import { SlashCommandBuilder } from "@discordjs/builders";

export interface Command {
    data: SlashCommandBuilder;
    execute: (interaction: any, mendicant: Mendicant) => Promise<void>;
    usage?: string;
}