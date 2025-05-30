import type { APIEmbedField } from "discord.js";
import type { Draft } from "../types";

export const getDraftFields = (draft: Draft) => {
  const roll1 = `**Roll: **${draft.roll1}\n`;
  const roll2 = `**Roll: **${draft.roll2}\n`;

  const protect1 = draft.protect1 ? `**Protect: **${draft.protect1}\n` : "";
  const protect2 = draft.protect2 ? `**Protect: **${draft.protect2}\n` : "";

  const ban1 = `**Ban: **${draft.ban1}\n`;
  const ban2 = `**Ban: **${draft.ban2}\n`;

  const fields: APIEmbedField[] = [
    {
      inline: true,
      name: draft.player1.username,
      value: `${roll1}${protect1}${ban1}`,
    },
    {
      inline: true,
      name: draft.player2.username,
      value: `${roll2}${protect2}${ban2}`,
    },
    { name: "\u200B", value: "\u200B" },
  ];

  return fields;
};
