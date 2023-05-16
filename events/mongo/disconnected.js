import chalk from "chalk";

export default {
  name: "disconnected",
  execute(client) {
    console.log(chalk.red("[Database Status]: Disconnected."));
  },
};
