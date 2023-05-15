import chalk from "chalk";

export default {
  name: "err",
  execute(client) {
    console.log(
      chalk.red(`An error occured with the database connection:\n${err}`)
    );
  },
};
