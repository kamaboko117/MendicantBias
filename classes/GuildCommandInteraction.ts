import type {
  ChatInputCommandInteraction,
  Guild,
  GuildMember,
} from "discord.js";

export interface GuildCommandInteraction
  extends ChatInputCommandInteraction<"raw" | "cached"> {
  guild: Guild;
  member: GuildMember;
}
