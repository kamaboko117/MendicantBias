import { SlashCommandBuilder } from "@discordjs/builders";

export default {
  data: new SlashCommandBuilder()
    .setName("invite")
    .setDescription("get my invite link"),
  async execute(interaction, client) {
    await interaction.reply({
      content: client.invite2,
    });
  },
};
