var colorize = require("colorize");
import { GatewayIntentBits, Client } from "discord.js";
import { handle } from "./discordEventManager";
import { init } from "./util/parsing/initManager";
import { start } from "./util/sqlHandler";
import { setupGit } from "./util/git";

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
await setupGit();
handle(client);
client.login(process.env.TOKEN);

console.log(colorize.ansify(`#green[(FerrumC)] Discord Bot initialised.`));
