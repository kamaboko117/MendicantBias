import { mendicantPlay, mendicantCreateItem } from "../../commands/music/play.js";

export default {
  data: {
    name: "play",
  },
  async execute(interaction, client) {
    const idsplit = interaction.component.customId.split(" ");
    const option1 = idsplit[1];
    const option2 = Number(idsplit[2]);
    let item = await mendicantCreateItem(interaction, option1);
    if (!item) {
      interaction.channel.send("Error: Could not create item (3)");
      return;
    }
    return mendicantPlay(interaction, item, client, false, option2);
  },
};
