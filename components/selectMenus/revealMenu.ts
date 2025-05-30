import type { StringSelectMenuInteraction } from "discord.js";
import Match from "../../schemas/match";

export default {
  data: {
    name: `revealMenu`,
  },
  async execute(interaction: StringSelectMenuInteraction) {
    const matchProfile = await Match.findOne({
      matchId: interaction.values[0],
    });
    if (!matchProfile) {
      await interaction.reply({
        content: `match does not exist in database: Probably deleted`,
      });
      return;
    }
    matchProfile.open = false;
    matchProfile.winner =
      matchProfile.votesRight > matchProfile.votesLeft
        ? matchProfile.playerRight
        : matchProfile.playerLeft;
    await matchProfile.save().catch(console.error);
    await interaction.reply({
      content: `${interaction.member} match results:\n${matchProfile.playerLeft} ${matchProfile.votesLeft} | ${matchProfile.votesRight} ${matchProfile.playerRight}\n${matchProfile.winner} wins !`,
    });
  },
};
