import { Client, Guild, Message } from "@fluxerjs/core";
import { getVoiceManager, VoiceManager } from "@fluxerjs/voice";
import { replyError } from "~/utils/reply.ts";
import { PlayCommand } from "~/commands/play.ts";
import { LeaveCommand } from "~/commands/leave.ts";
import { HelpCommand } from "~/commands/help.ts";
import { COMMAND_PREFIX } from "~/utils/constants.ts";

export interface Command {
  name: string;
  description: string;
  examples: Record<string, string>;
  run(context: CommandRunContext): Promise<void>;
}

export interface CommandRunContext {
  client: Client;
  voiceManager: VoiceManager;
  commands: ReadonlyArray<Command>;
  message: Message;
  args: string[];
  guild: Guild;
}

export class CommandHandler {
  private readonly commands: Command[] = [
    new HelpCommand(),
    new PlayCommand(),
    new LeaveCommand(),
  ];

  public async onMessageCreate(client: Client, message: Message): Promise<void> {
    if (message.author.bot) {
      return;
    }

    for (const command of this.commands) {
      if (message.content.startsWith(COMMAND_PREFIX + command.name)) {
        await this.run(command, client, message);
        return;
      }
    }
  }

  private async run(command: Command, client: Client, message: Message): Promise<void> {
    const guild = message.guild;
    if (guild === null) {
      await replyError(message, "Fluxboat requires a server");
      return;
    }

    const args = message.content.split(" ").slice(1);

    await command.run({
      client,
      voiceManager: getVoiceManager(client),
      commands: this.commands,
      message,
      args,
      guild,
    });
  }
}
