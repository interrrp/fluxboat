import "@std/dotenv/load";
import { Client } from "@fluxerjs/core";

const client = new Client({ intents: 0 });

client.events
  .Ready(() => {
    console.log("ready");
  })
  .events.MessageCreate(async (message) => {
    if (message.content === "fb!ping") {
      await message.reply("Pong!");
    }
  });

const botToken = Deno.env.get("FB_BOT_TOKEN");
if (!botToken) {
  throw new Error(`missing environment variable FB_BOT_TOKEN`);
}
await client.login(botToken);
