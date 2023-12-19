import { StringSelectMenuInteraction } from "discord.js";
import Match from "../../schemas/match";
import { Mendicant } from "../../classes/Mendicant.js";

export default {
  data: {
    name: `deleteMenu`,
  },
  async execute(interaction: StringSelectMenuInteraction, mendicant: Mendicant) {
    const matchIdToDelete = interaction.values[0];
    await Match.deleteOne({ matchId: matchIdToDelete });

    for (let i = Number(matchIdToDelete) + 1; i <= mendicant.matchCount; i++) {
      const matchProfile = await Match.findOne({ matchId: i });
      if (!matchProfile) continue;
      matchProfile.matchId--;
      await matchProfile.save().catch(console.error);
    }

    mendicant.matchCount--;

    await interaction.reply({
      content: `Match deleted: ${matchIdToDelete}`,
    });
  },
};
