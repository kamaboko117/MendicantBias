import mongoose from "mongoose";
import events from "../../events/index.js";
const connection = mongoose.connection;

export default (client) => {
  client.handleEvents = async () => {
    const clientEvents = events.client;
    Object.keys(clientEvents).forEach((key) => {
      const event = clientEvents[key];
      if (event.once)
        client.once(event.name, (...args) => event.execute(...args, client));
      else client.on(event.name, (...args) => event.execute(...args, client));
    });

    const mongoEvents = events.mongo;
    Object.keys(mongoEvents).forEach((key) => {
      const event = mongoEvents[key];
      if (event.once)
        connection.once(event.name, (...args) =>
          event.execute(...args, client)
        );
      else
        connection.on(event.name, (...args) => event.execute(...args, client));
    });
  };
};
