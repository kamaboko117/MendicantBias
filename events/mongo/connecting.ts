export default {
  name: "connecting",
  execute: async () => {
    const chalk = await import('chalk');
    console.log(chalk.default.cyan("[Database Status]: Connecting..."));
  },
};
