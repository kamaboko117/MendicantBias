import type { ButtonInteraction, Role } from "discord.js";
import { GuildMember } from "discord.js";

export default {
  data: {
    name: "autorole",
  },
  async execute(interaction: ButtonInteraction) {
    if (interaction.member instanceof GuildMember) {
      const role: Role | undefined = interaction.member.guild.roles.cache.find(
        (role: Role) => role.name === "emotedokai"
      );
      if (role) {
        await interaction.member.roles.add(role);
      }
    }

    await interaction.reply({
      content: "Done",
      ephemeral: true,
    });
  },
};
