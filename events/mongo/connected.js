const chalk = require("chalk");

module.exports = {
    name: "connected",
    execute(client) {
        console.log(chalk.green("[Database Status]: Connected."));
    },
};