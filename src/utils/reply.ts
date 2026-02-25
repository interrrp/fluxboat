import { EmbedBuilder, Message } from "@fluxerjs/core";

export async function replyError(message: Message, error: string): Promise<void> {
  const embed = new EmbedBuilder()
    .setDescription(`❌ ${error}`)
    .setColor(0xFF0000)
    .toJSON();
  await message.send({ embeds: [embed] });
}

export async function replySuccess(message: Message, success: string): Promise<void> {
  const embed = new EmbedBuilder()
    .setDescription(`✅ ${success}`)
    .setColor(0x00FF00)
    .toJSON();
  await message.send({ embeds: [embed] });
}
