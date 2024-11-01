import { ButtonInteraction, Guild, GuildMember } from "discord.js";

export default interface GuildButtonInteraction extends ButtonInteraction<'raw' | 'cached'> {
  guild: Guild;
  member: GuildMember;
}