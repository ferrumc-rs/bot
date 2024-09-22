var colorize =  require('colorize')
const { GatewayIntentBits, Client } = require("discord.js")
const { handle } = require("./discordEventManager")
const { init } = require('./util/parsing/initManager');
const { start } = require("./util/sqlHandler")

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
})

const system = require("node:process");

system.on('unhandledRejection', async (reason: any, promise: any) => {
    console.log('Unhandled Rejection at:', promise, 'reason', reason);
});

system.on('uncaughtException', (err: any) => {
    console.log('Uncaught Exception:', err);
});

system.on('uncaughtExceptionMonitor', (err: any, origin: any) => {
    console.log('Uncaught Exception Monitor', err, origin);
});

console.log(colorize.ansify(`#green[(FerrumC)] #grey[Initialising Discord Bot...]`))

start(client);
init();
handle(client);
client.login(process.env.TOKEN)

console.log(colorize.ansify(`#green[(FerrumC)] Discord Bot initialised.`))