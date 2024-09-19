import colorize from 'colorize';
import { GatewayIntentBits, Client } from 'discord.js';
import { handle } from './discordEventManager';
import { init } from './util/parsing/initManager';
import { getLatestCommit } from './util/apiUtil';
import { schedule } from 'node-cron'

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
})

console.log(colorize.ansify(`#green[(FerrumC)] #grey[Initialising Discord Bot...]`))

init();
handle(client);
client.login(process.env.TOKEN)

console.log(colorize.ansify(`#green[(FerrumC)] Discord Bot initialised.`))

schedule("*/3 * * * *", () => {
    console.log(colorize.ansify("#grey[Fetching latest commits]"))
    getLatestCommit()
})