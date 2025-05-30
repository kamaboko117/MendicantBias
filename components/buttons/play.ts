import type GuildButtonInteraction from "../../classes/GuildButtonInteraction";
import type { Mendicant } from "../../classes/Mendicant";
import { mendicantCreateItem } from "../../commands/music/helpers/mendicantCreateItem";
import { mendicantPlay } from "../../commands/music/helpers/mendicantPlay";

export default {
  data: {
    name: "play",
  },
  async execute(interaction: GuildButtonInteraction, mendicant: Mendicant) {
    const idsplit = interaction.customId.split(" ");
    const option1 = idsplit[1];
    const option2 = Number(idsplit[2]);
    const item = await mendicantCreateItem(option1, null);

    if (!item) {
      interaction.channel?.send("Error: Could not create item (3)");
      return;
    }

    return mendicantPlay(interaction, item, mendicant, false, option2);
  },
};
