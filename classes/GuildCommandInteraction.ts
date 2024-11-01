import { ChatInputCommandInteraction, Guild, GuildMember } from "discord.js";

export default interface GuildCommandInteraction extends ChatInputCommandInteraction<'raw' | 'cached'> {
  guild: Guild;
  member: GuildMember;
}
