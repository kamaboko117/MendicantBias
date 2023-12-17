import { APIButtonComponentWithCustomId } from "discord.js";
import { mendicantPlay, mendicantCreateItem } from "../../commands/music/play";
import { Mendicant } from "../../classes/Mendicant";
import GuildButtonInteraction from "../../classes/GuildButtonInteraction";

export default {
  data: {
    name: "play",
  },
  async execute(interaction: GuildButtonInteraction, mendicant: Mendicant) {
    const idsplit = interaction.customId.split(" ");
    const option1 = idsplit[1];
    const option2 = Number(idsplit[2]);
    let item = await mendicantCreateItem(option1, null);
    if (!item) {
      interaction.channel?.send("Error: Could not create item (3)");
      return;
    }
    return mendicantPlay(interaction, item, mendicant, false, option2);
  },
};
