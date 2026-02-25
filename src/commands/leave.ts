import { Command, CommandRunContext } from "~/commands/handler.ts";
import { replyError, replySuccess } from "~/utils/reply.ts";

export class LeaveCommand implements Command {
  public name = "leave";
  public description = "Leaves your voice channel";
  public examples = { "Leave your voice channel": "leave" };

  public async run({ voiceManager, message, guild }: CommandRunContext): Promise<void> {
    const voiceChannelId = voiceManager.getVoiceChannelId(guild.id, message.author.id);
    if (voiceChannelId === null) {
      // VoiceManager doesn't set the voice channel to null when we
      // leave the channel, so this check never runs for some reason
      await replyError(message, "I'm not in any voice channel");
      return;
    }

    voiceManager.leaveChannel(voiceChannelId);
    await replySuccess(message, `Left <#${voiceChannelId}>`);
  }
}
