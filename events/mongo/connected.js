import chalk from "chalk";

export default {
  name: "connected",
  execute(client) {
    console.log(chalk.green("[Database Status]: Connected."));
  },
};
