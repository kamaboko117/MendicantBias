import type { ModalSubmitInteraction } from "discord.js";

// match feed creation submit is handled in a separate collector
// so that context can be kept,
// here we only check if the interaction is solved or not
// if collector expires the interaction will not be solved so
// we handle it here
// we assume that collector is expired if interaction takes longer than 2secs
// to be solved
export default {
  data: {
    name: "match-feed-form",
  },
  async execute(interaction: ModalSubmitInteraction) {
    // wait 2sec
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // check if the interaction has been replied to
    if (interaction.replied) {
      return;
    }
    interaction.reply("Modal timed out. You should fill the form faster");
  },
};
