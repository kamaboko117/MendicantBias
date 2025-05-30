import type {
  ClientOptions,
  Guild,
  Interaction,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from "discord.js";
import { Client, Collection } from "discord.js";
import functions from "../functions/index";
import type { MusicQueue } from "../types/MusicQueue";
import type { GuildButtonInteraction } from "./GuildButtonInteraction";
import { Queue } from "./Queue";

export class Mendicant extends Client {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public commands: Collection<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public buttons: Collection<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public selectMenus: Collection<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public modals: Collection<string, any>;
  public commandArray: RESTPostAPIChatInputApplicationCommandsJSONBody[];
  public color: number;
  public queues: MusicQueue[];
  public voteQueue: Queue<GuildButtonInteraction>;
  public challongeVoteQueue: Queue<GuildButtonInteraction>;
  public timeoutIds: {
    timeoutId: NodeJS.Timeout;
    guildId: Guild["id"];
  }[];
  public matchCount: number;
  public osuApiUrl: string;

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
    this.osuApiUrl = "https://osu.ppy.sh/api/v2";
    this.handleCommands = () => {};
    this.handleComponents = () => {};
    this.handleEvents = () => {};
    this.voteRoutine = () => {};
    Object.keys(functions).forEach((key) => {
      functions[key as keyof typeof functions](this);
    });
  }

  public logInteraction(interaction: Interaction) {
    if (interaction.isCommand()) {
      console.log(
        `${interaction.user.username} used /${interaction.commandName}`
      );
    } else if (interaction.isButton()) {
      console.log(
        `${interaction.user.username} clicked button ${interaction.customId}`
      );
    }
  }
}
