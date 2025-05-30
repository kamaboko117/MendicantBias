import type { BaseInteraction } from "discord.js";
import type { Mendicant } from "../../classes/Mendicant";

export default {
  name: "interactionCreate",
  async execute(interaction: BaseInteraction, mendicant: Mendicant) {
    if (interaction.isChatInputCommand()) {
      const { commands } = mendicant;
      const { commandName } = interaction;
      const command = commands.get(commandName);
      if (!command) return;
      try {
        await command.execute(interaction, mendicant);
      } catch (error) {
        console.error(error);
        if (interaction.deferred) {
          await interaction.editReply(`Command execution error: ${error}`);
          return;
        }
        await interaction.reply({
          content: `Command execution error: ${error}`,
          ephemeral: true,
        });
      }
    } else if (interaction.isButton()) {
      const { buttons } = mendicant;
      const { customId } = interaction;
      const button = buttons.get(customId);
      if (!button) {
        const type = customId.split(" ")[0];
        if (type === "T") {
          await buttons.get("tourney").execute(interaction, mendicant);
        } else if (type === "C") {
          await buttons.get("challongeTourney").execute(interaction, mendicant);
        } else if (type === "P") {
          await buttons.get("play").execute(interaction, mendicant);
        } else if (type === "A") {
          await buttons.get("acceptplaylist").execute(interaction, mendicant);
        } else if (type === "Q") {
          await buttons.get("queue").execute(interaction, mendicant);
        } else if (type === "S") {
          await buttons
            .get("acceptplaylistshuffle")
            .execute(interaction, mendicant);
        } else if (type === "skip") {
          await buttons.get("skip").execute(interaction, mendicant);
        } else if (type === "shuffle") {
          await buttons.get("shuffle").execute(interaction, mendicant);
        } else if (type === "stop") {
          await buttons.get("stop").execute(interaction, mendicant);
        } else {
          try {
            await buttons.get("default").execute(interaction, mendicant);
          } catch (err) {
            console.error(err);
          }
        }
      } else {
        try {
          await button.execute(interaction, mendicant);
        } catch (err) {
          console.error(err);
        }
      }
    } else if (interaction.isStringSelectMenu()) {
      const { selectMenus } = mendicant;
      const { customId } = interaction;
      const menu = selectMenus.get(customId);
      if (!menu) return new Error("no code for this menu");
      try {
        await menu.execute(interaction, mendicant);
      } catch (error) {
        console.error(error);
      }
    } else if (interaction.isAutocomplete()) {
      const { commands } = mendicant;
      const { commandName } = interaction;
      const command = commands.get(commandName);
      if (!command) return;
      try {
        await command.autocomplete(interaction, mendicant);
      } catch (error) {
        console.error(error);
      }
    } else if (interaction.isModalSubmit()) {
      const { modals } = mendicant;
      const { customId } = interaction;
      const modal = modals.get(customId);
      if (!modal) return new Error("No code for this modal");
      try {
        await modal.execute(interaction, mendicant);
      } catch (error) {
        console.error(error);
      }
    }
  },
};
