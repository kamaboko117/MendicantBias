import chalk from "chalk";

export default {
  name: "connecting",
  execute(client) {
    console.log(chalk.cyan("[Database Status]: Connecting..."));
  },
};
