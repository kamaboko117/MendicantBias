import { ClientOptions, Collection, Client } from "discord.js";
import { Queue } from "./Queue";
import functions from "../functions/index";

export class Mendicant extends Client {
  public commands: Collection<string, any>;
  public buttons: Collection<string, any>;
  public selectMenus: Collection<string, any>;
  public modals: Collection<string, any>;
  public commandArray: any[];
  public color: number;
  public queues: any[];
  public voteQueue: Queue;
  public challongeVoteQueue: Queue;
  public timeoutIds: any[];
  public matchCount: number;
  public handleCommands: () => void;
  public handleComponents: () => void;
  public handleEvents: () => void;
  public voteRoutine: () => void;
  constructor(options: ClientOptions) {
    super(options);
    this.commands = new Collection();
    this.buttons = new Collection();
    this.selectMenus = new Collection();
    this.modals = new Collection();
    this.commandArray = [];
    this.color = 0x18e1ee;
    this.queues = [];
    this.voteQueue = new Queue();
    this.challongeVoteQueue = new Queue();
    this.timeoutIds = [];
    this.matchCount = 0;
    this.handleCommands = () => {};
    this.handleComponents = () => {};
    this.handleEvents = () => {};
    this.voteRoutine = () => {};
    Object.keys(functions).forEach((key) => {
      functions[key as keyof typeof functions](this);
    });
  }
}
