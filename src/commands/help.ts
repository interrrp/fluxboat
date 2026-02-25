import { Command, CommandRunContext } from "~/commands/handler.ts";
import { replyError } from "~/utils/reply.ts";
import { EmbedBuilder } from "@fluxerjs/core";
import { COMMAND_PREFIX } from "~/utils/constants.ts";

export class HelpCommand implements Command {
  public name = "help";
  public description = "Shows information about commands";
  public examples = {
    "Show all commands": "help",
    "Show `play` command": "help play",
  };

  public async run(context: CommandRunContext): Promise<void> {
    if (context.args.length === 0) {
      await this.showAllCommands(context);
    } else {
      await this.showSpecificCommand(context);
    }
  }

  private async showAllCommands({ message, commands }: CommandRunContext): Promise<void> {
    const embed = new EmbedBuilder().setTitle("Commands");
    for (const command of commands.slice(0, 24)) {
      embed.addFields({ name: COMMAND_PREFIX + command.name, value: command.description });
    }
    await message.reply({ embeds: [embed] });
  }

  private async showSpecificCommand({ message, args, commands }: CommandRunContext): Promise<void> {
    const requestedCommandName = args[0];

    const command = commands.find((c) => c.name === requestedCommandName);
    if (command === undefined) {
      await replyError(message, `Unknown command ${requestedCommandName}`);
      return;
    }

    const examplesFieldText = Object.entries(command.examples)
      .map(([description, usage]) => `- ${description}: \`${COMMAND_PREFIX}${usage}\``)
      .join("\n");

    const embed = new EmbedBuilder()
      .setTitle(COMMAND_PREFIX + command.name)
      .setDescription(command.description)
      .addFields({ name: "Examples", value: examplesFieldText });

    await message.reply({ embeds: [embed] });
  }
}
