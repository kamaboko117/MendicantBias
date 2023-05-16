import { InteractionType } from "discord.js";

export default {
  name: "interactionCreate",
  async execute(interaction, client) {
    if (interaction.isChatInputCommand()) {
      const { commands } = client;
      const { commandName } = interaction;
      const command = commands.get(commandName);
      if (!command) return;
      try {
        await command.execute(interaction, client);
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
      const { buttons } = client;
      const { customId } = interaction;
      const button = buttons.get(customId);
      if (!button) {
        let type = customId.split(" ")[0];
        if (type === "T") {
          await buttons.get("tourney").execute(interaction, client);
        } else if (type === "P") {
          await buttons.get("play").execute(interaction, client);
        } else if (type === "A") {
          await buttons.get("acceptplaylist").execute(interaction, client);
        } else if (type === "Q") {
          await buttons.get("queue").execute(interaction, client);
        } else if (type === "skip") {
          await buttons.get("skip").execute(interaction, client);
        } else if (type === "shuffle") {
          await buttons.get("shuffle").execute(interaction, client);
        } else if (type === "stop") {
          await buttons.get("stop").execute(interaction, client);
        } else {
          try {
            await buttons.get("default").execute(interaction, client);
          } catch (err) {
            console.error(err);
          }
        }
      } else {
        try {
          await button.execute(interaction, client);
        } catch (err) {
          console.error(err);
        }
      }
    } else if (interaction.isStringSelectMenu()) {
      const { selectMenus } = client;
      const { customId } = interaction;
      const menu = selectMenus.get(customId);
      if (!menu) return new Error("no code for this menu");
      try {
        await menu.execute(interaction, client);
      } catch (error) {
        console.error(error);
      }
    } else if (
      interaction.type == InteractionType.ApplicationCommandAutocomplete
    ) {
      const { commands } = client;
      const { commandName } = interaction;
      const command = commands.get(commandName);
      if (!command) return;
      try {
        await command.autocomplete(interaction, client);
      } catch (error) {
        console.error(error);
      }
    } else if (interaction.type == InteractionType.ModalSubmit) {
      const { modals } = client;
      const { customId } = interaction;
      const modal = modals.get(customId);
      if (!modal) return new Error("No code for this modal");
      try {
        await modal.execute(interaction, client);
      } catch (error) {
        console.error(error);
      }
    }
  },
};
