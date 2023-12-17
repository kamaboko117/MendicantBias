import { ChatInputCommandInteraction, Guild, GuildMember } from "discord.js";

export default interface GuildCommandInteraction extends ChatInputCommandInteraction {
  guild: Guild;
  member: GuildMember;
}
