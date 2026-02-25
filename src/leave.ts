import { Message } from "@fluxerjs/core";
import { VoiceManager } from "@fluxerjs/voice";
import { replyError, replySuccess } from "./reply.ts";

export class LeaveCommand {
  constructor(
    private voiceManager: VoiceManager,
    private message: Message,
  ) {}

  public async run(): Promise<void> {
    const guildId = this.message.guild?.id;
    if (guildId === undefined) {
      await replyError(this.message, "This command is server-only");
      return;
    }

    const voiceChannelId = this.voiceManager.getVoiceChannelId(guildId, this.message.author.id);
    if (voiceChannelId === null) {
      // VoiceManager doesn't set the voice channel to null when we
      // leave the channel, so this check never runs for some reason
      await replyError(this.message, "I'm not in any voice channel");
      return;
    }

    this.voiceManager.leaveChannel(voiceChannelId);
    await replySuccess(this.message, `Left <#${voiceChannelId}>`);
  }
}
