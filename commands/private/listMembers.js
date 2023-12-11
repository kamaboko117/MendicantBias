import { SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("list-members")
    .setDescription("get the list of all the members in a guild")
    .addStringOption((option) =>
      option
        .setName("guild")
        .setDescription("the guild to get the list of members from")
        .setRequired(true)
    ),

  async execute(interaction, client) {
    const guilds = client.guilds.cache.map((guild) => guild.name);
    const option = interaction.options.getString("guild");
    // find the guild with the name option
    const guild = client.guilds.cache.find((guild) => guild.name === option);
    if (!guild) {
      await interaction.reply({
        content: `Error: Guild ${option} not found`,
        ephemeral: false,
      });
      return;
    }
    // update the cache
    await guild.members.fetch();
    // get the members of the guild
    const members = guild.members.cache.map((member) => member.displayName);

    await interaction.reply({
      content: `**Number of Members:** ${
        members.length
      }\n**Members:**\n${members.join("\n")}`,
      ephemeral: false,
    });
  },

  usage: "",
};
