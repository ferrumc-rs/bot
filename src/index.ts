var colorize = require("colorize");
import { GatewayIntentBits, Client, TextChannel } from "discord.js";
import { handle } from "./discordEventManager";
import { init } from "./util/parsing/initManager";
import { start } from "./util/sqlHandler";
import { setupGit } from "./util/git";
import { getRepoInfo } from "./util/apiUtil";
import * as cron from 'node-cron';


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

const job = cron.schedule('* * * * *', async () => {
    let repoInfoPromise = getRepoInfo();

    let [repoInfo] = await Promise.all([
        repoInfoPromise
    ])

    let starcount = repoInfo.stargazers_count;
    if (starcount >= 1000) {
        stop();
        const channel = client.channels.cache.get("1279761143874977915");
        if (channel?.isTextBased()) {
            (channel as TextChannel).send({
                content: `@everyone\n` + 
                `We have just hit 1000 stars on our [GitHub](<https://github.com/ferrumc-rs/ferrumc>)!\n` +
                `Thank you all so much for your support!`
            })
        }
    }
});
function stop() {
    job.stop();
}