import colorize from 'colorize';
import { GatewayIntentBits, Client } from 'discord.js';
import { handle } from './discordEventManager';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
})

console.log(colorize.ansify(`#green[(FerrumC)] #grey[Initialising Discord Bot...]`))

handle(client);
client.login(process.env.TOKEN)

console.log(colorize.ansify(`#green[(FerrumC)] Discord Bot initialised.`))