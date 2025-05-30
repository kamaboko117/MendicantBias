import type { Mendicant } from "../../classes/Mendicant";

export default {
  name: "ready",
  once: true,
  async execute(mendicant: Mendicant) {
    mendicant.handleCommands();
    console.log(
      `machine status: fully operational => ${mendicant.user?.tag} is online`
    );
  },
};
