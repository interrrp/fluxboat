import { assert } from "@std/assert";
import { VoiceChannel } from "@fluxerjs/core";
import { replyError, replySuccess } from "~/utils/reply.ts";
import { Command, CommandRunContext } from "~/commands/handler.ts";

export class PlayCommand implements Command {
  public name = "play";
  public description = "Plays a song in your current voice channel";
  public examples = { "Play a YouTube video": "play https://www.youtube.com/watch?v=XFkzRNyygfk" };

  public async run({ client, voiceManager, message, guild }: CommandRunContext): Promise<void> {
    const request = this.getRequest(message.content);
    if (request === null) {
      await replyError(message, "Usage: play <url or search query>");
      return;
    }

    if ("searchQuery" in request) {
      await replyError(message, "Search queries are unimplemented");
      return;
    }

    const voiceChannelId = voiceManager.getVoiceChannelId(guild.id, message.author.id);
    if (voiceChannelId === null) {
      await replyError(message, "Join a voice channel first");
      return;
    }

    const voiceChannel = client.channels.get(voiceChannelId);
    assert(voiceChannel instanceof VoiceChannel, "voice channel was not VoiceChannel");

    const connection = await voiceManager.join(voiceChannel);
    await replySuccess(message, `Joined <#${voiceChannelId}>`);

    try {
      const streamUrl = await this.fetchStreamUrl(request.mediaUrl);
      await connection.play(streamUrl);
    } catch (error) {
      console.error(error);
      connection.disconnect();
      await message.reply("An unexpected error occurred, and I had to leave");
    }
  }

  private async fetchStreamUrl(mediaUrl: string): Promise<string> {
    const ytdl = new Deno.Command("yt-dlp", {
      args: [
        mediaUrl,
        "-g",
        "-f",
        "bestaudio[ext=webm][acodec=opus]/bestaudio[ext=webm]/bestaudio",
      ],
      stdout: "piped",
    });
    const { stdout } = await ytdl.output();
    return new TextDecoder().decode(stdout);
  }

  private getRequest(content: string): { mediaUrl: string } | { searchQuery: string } | null {
    const parts = content.split(" ");
    if (parts.length === 1) {
      return null;
    }

    const request = parts.slice(1).join(" ");
    if (request.startsWith("https://")) {
      return { mediaUrl: request };
    } else {
      return { searchQuery: request };
    }
  }
}
