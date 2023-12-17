export default {
  name: "err",
  async execute(err: Error) {
    const chalk = await import('chalk');
    console.log(
      chalk.default.red(`An error occured with the database connection:\n${err}`)
    );
  },
};
