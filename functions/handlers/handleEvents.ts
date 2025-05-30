import mongoose from "mongoose";
import type { Mendicant } from "../../classes/Mendicant.js";
import events from "../../events/index";

const connection = mongoose.connection;

export default (mendicant: Mendicant) => {
  mendicant.handleEvents = async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const clientEvents: { [key: string]: any } = events.client;
    Object.keys(clientEvents).forEach((key) => {
      const event = clientEvents[key];
      if (event.once)
        mendicant.once(event.name, (...args) =>
          event.execute(...args, mendicant)
        );
      else
        mendicant.on(event.name, (...args) =>
          event.execute(...args, mendicant)
        );
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mongoEvents: { [key: string]: any } = events.mongo;
    Object.keys(mongoEvents).forEach((key) => {
      const event = mongoEvents[key];
      if (event.once)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        connection.once(event.name, (...args: any) =>
          event.execute(...args, mendicant)
        );
      else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        connection.on(event.name, (...args: any) =>
          event.execute(...args, mendicant)
        );
      }
    });
  };
};
