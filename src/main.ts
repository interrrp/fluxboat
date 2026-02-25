import "@std/dotenv/load";
import { Bot } from "~/bot.ts";

await new Bot().run();
