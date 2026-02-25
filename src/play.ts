import { Client, Message, VoiceChannel } from "@fluxerjs/core";
import { VoiceManager } from "@fluxerjs/voice";
import { assert } from "@std/assert";
import { replyError, replySuccess } from "./reply.ts";

export class PlayCommand {
  constructor(
    private client: Client,
    private voiceManager: VoiceManager,
    private message: Message,
  ) {}

  public async run(): Promise<void> {
    const request = this.getRequest();
    if (request === null) {
      await replyError(this.message, "Usage: b!play <url or search query>");
      return;
    }

    if ("searchQuery" in request) {
      await replyError(this.message, "Search queries are unimplemented");
      return;
    }

    const guildId = this.message.guild?.id;
    if (guildId === undefined) {
      await replyError(this.message, "This command is server-only");
      return;
    }

    const voiceChannelId = this.voiceManager.getVoiceChannelId(guildId, this.message.author.id);
    if (voiceChannelId === null) {
      await replyError(this.message, "Join a voice channel first");
      return;
    }

    const voiceChannel = this.client.channels.get(voiceChannelId);
    assert(voiceChannel instanceof VoiceChannel, "voice channel was not VoiceChannel");

    const connection = await this.voiceManager.join(voiceChannel);
    await replySuccess(this.message, `Joined <#${voiceChannelId}>`);

    const ytdl = new Deno.Command("yt-dlp", {
      args: [
        request.url,
        "-g",
        "-f",
        "bestaudio[ext=webm][acodec=opus]/bestaudio[ext=webm]/bestaudio",
      ],
      stdout: "piped",
    });
    const { stdout } = await ytdl.output();
    const url = new TextDecoder().decode(stdout);

    try {
      await connection.play(url);
    } catch (error) {
      console.error(error);
      connection.disconnect();
      await this.message.reply("An unexpected error occurred, and I had to leave");
    }
  }

  private getRequest(): { url: string } | { searchQuery: string } | null {
    const parts = this.message.content.split(" ");
    if (parts.length === 1) {
      return null;
    }

    const request = parts.slice(1).join(" ");
    if (request.startsWith("https://")) {
      return { url: request };
    } else {
      return { searchQuery: request };
    }
  }
}
