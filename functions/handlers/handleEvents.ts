import mongoose from "mongoose";
import events from "../../events/index";
import { Mendicant } from "../../classes/Mendicant.js";
const connection = mongoose.connection;

export default (mendicant: Mendicant) => {
  mendicant.handleEvents = async () => {
    const clientEvents: { [key: string]: any } = events.client;
    Object.keys(clientEvents).forEach((key) => {
      const event = clientEvents[key];
      if (event.once)
        mendicant.once(event.name, (...args) => event.execute(...args, mendicant));
      else mendicant.on(event.name, (...args) => event.execute(...args, mendicant));
    });

    const mongoEvents: { [key: string]: any } = events.mongo;
    Object.keys(mongoEvents).forEach((key) => {
      const event = mongoEvents[key];
      if (event.once)
        connection.once(event.name, (...args) =>
          event.execute(...args, mendicant)
        );
      else
        connection.on(event.name, (...args) => event.execute(...args, mendicant));
    });
  };
};
