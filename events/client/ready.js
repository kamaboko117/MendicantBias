export default {
  name: "ready",
  once: true,
  async execute(client) {
    console.log(
      `machine status: fully operational => ${client.user.tag} is online`
    );
  },
};
