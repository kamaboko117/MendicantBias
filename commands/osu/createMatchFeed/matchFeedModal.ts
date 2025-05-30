import type { ModalActionRowComponentBuilder } from "discord.js";
import {
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import type { OsuApiUser } from "./helpers/types";

export const getModal = (players: OsuApiUser[], name: string) => {
  const modal = new ModalBuilder()
    .setCustomId("match-feed-form")
    .setTitle(name.slice(0, 45));

  const player1RollsInput = new TextInputBuilder()
    .setCustomId("player1RollsInput")
    .setLabel(`${players[0].username} roll`.slice(0, 45))
    .setStyle(TextInputStyle.Short);

  const player2RollsInput = new TextInputBuilder()
    .setCustomId("player2RollsInput")
    .setLabel(`${players[1].username} roll`.slice(0, 45))
    .setStyle(TextInputStyle.Short);

  const player1BanAndProtectInput = new TextInputBuilder()
    .setCustomId("player1ProtectInput")
    .setLabel(`${players[0].username} protect and/or ban`.slice(0, 45))
    .setPlaceholder("<Protect> <Ban> (Protect is optional)")
    .setStyle(TextInputStyle.Short);

  const player2BanAndProtectInput = new TextInputBuilder()
    .setCustomId("player2ProtectInput")
    .setLabel(`${players[1].username} protect and/or ban`.slice(0, 45))
    .setPlaceholder("<Protect> <Ban> (Protect is optional)")
    .setStyle(TextInputStyle.Short);

  const firstActionRow =
    new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
      player1RollsInput
    );

  const secondActionRow =
    new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
      player2RollsInput
    );

  const thirdActionRow =
    new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
      player1BanAndProtectInput
    );

  const fourthActionRow =
    new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
      player2BanAndProtectInput
    );

  modal.addComponents(
    firstActionRow,
    secondActionRow,
    thirdActionRow,
    fourthActionRow
  );

  return modal;
};
