import type { ButtonInteraction, Guild, GuildMember } from "discord.js";

export interface GuildButtonInteraction
  extends ButtonInteraction<"raw" | "cached"> {
  guild: Guild;
  member: GuildMember;
}
