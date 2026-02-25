import { Client, Message } from "@fluxerjs/core";
import { CommandHandler } from "~/commands/handler.ts";

export class Bot {
  private client: Client;
  private commandHandler: CommandHandler;

  constructor() {
    this.client = new Client({ intents: 0 })
      .events.Ready(this.onReady.bind(this))
      .events.MessageCreate(this.onMessageCreate.bind(this));

    this.commandHandler = new CommandHandler();
  }

  public async run(): Promise<void> {
    const botToken = Deno.env.get("FLUXBOAT_BOT_TOKEN");
    if (!botToken) {
      throw new Error(`missing environment variable FLUXBOAT_BOT_TOKEN`);
    }
    await this.client.login(botToken);
  }

  private onReady(): void {
    console.log("ready");
  }

  private async onMessageCreate(message: Message): Promise<void> {
    await this.commandHandler.onMessageCreate(this.client, message);
  }
}
