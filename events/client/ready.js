export default {
  name: "ready",
  once: true,
  async execute(client) {
    client.handleCommands();
    console.log(
      `machine status: fully operational => ${client.user.tag} is online`
    );
  },
};
