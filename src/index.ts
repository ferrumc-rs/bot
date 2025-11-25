var colorize = require("colorize");
import { GatewayIntentBits, Client, TextChannel } from "discord.js";
import { handle } from "./discordEventManager";
import { init } from "./util/parsing/initManager";
import { start } from "./util/sqlHandler";
import { getRepoInfo } from "./util/apiUtil";
import * as cron from "node-cron";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

import system from "node:process";

system.on("unhandledRejection", async (reason: any, promise: any) => {
  console.log("Unhandled Rejection at:", promise, "reason", reason);
});

system.on("uncaughtException", (err: any) => {
  console.log("Uncaught Exception:", err);
});

system.on("uncaughtExceptionMonitor", (err: any, origin: any) => {
  console.log("Uncaught Exception Monitor", err, origin);
});

console.log(
  colorize.ansify(`#green[(FerrumC)] #grey[Initialising Discord Bot...]`)
);

start(client);
init();
handle(client);
client.login(process.env.TOKEN);

console.log(colorize.ansify(`#green[(FerrumC)] Discord Bot initialised.`));
