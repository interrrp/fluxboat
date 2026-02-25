import { Client, Message } from "@fluxerjs/core";
import { getVoiceManager, VoiceManager } from "@fluxerjs/voice";
import { PlayCommand } from "./play.ts";

export class Bot {
  private client: Client;
  private voiceManager: VoiceManager;

  constructor() {
    this.client = new Client({ intents: 0 })
      .events.Ready(this.onReady.bind(this))
      .events.MessageCreate(this.onMessageCreate.bind(this));

    this.voiceManager = getVoiceManager(this.client);
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
    if (message.author.bot) {
      return;
    }

    if (message.content.startsWith("b!play")) {
      await new PlayCommand(this.client, this.voiceManager, message).run();
    }
  }
}
