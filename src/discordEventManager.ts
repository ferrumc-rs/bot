import { Client, type ClientEvents } from 'discord.js'
import { getFiles } from './util/filesUtil';

export function handle(client: Client) {
    const folders = getFiles(__dirname + "/events", true);

    for (const folder of folders) {
        const files = getFiles(folder);
        
        // Ensure name is always defined
        const name = folder.replace(/\\/g, "/").split("/").pop() || 'default';
        
        client.on(name as keyof ClientEvents, async (...args) => {
            for (const file of files) {
                const eventFunction = require(file);
                await eventFunction(client, ...args)
            }
        });
    }
}