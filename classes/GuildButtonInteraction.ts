import { ButtonInteraction, Guild, GuildMember } from "discord.js";

export default interface GuildButtonInteraction extends ButtonInteraction {
  guild: Guild;
  member: GuildMember;
}