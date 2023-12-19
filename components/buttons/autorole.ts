import { ButtonInteraction, GuildMember, Role } from "discord.js";
import { Mendicant } from "../../classes/Mendicant";

export default {
  data: {
    name: "autorole",
  },
  async execute(interaction: ButtonInteraction, mendicant: Mendicant) {
    if (interaction.member instanceof GuildMember) {
      let role: Role | undefined = interaction.member.guild.roles.cache.find(
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
