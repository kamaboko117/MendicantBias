import { SlashCommandBuilder } from "@discordjs/builders";
import type { GuildCommandInteraction } from "../../classes/GuildCommandInteraction";
import type { Mendicant } from "../../classes/Mendicant";

export default {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Request my ping"),
  async execute(interaction: GuildCommandInteraction, mendicant: Mendicant) {
    const message = await interaction.deferReply({
      fetchReply: true,
    });
    const newMessage = `API Latency: ${mendicant.ws.ping}\nClient Ping: ${
      message.createdTimestamp - interaction.createdTimestamp
    }`;
    await interaction.editReply({
      content: newMessage,
    });
  },
};
