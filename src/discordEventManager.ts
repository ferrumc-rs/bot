const { getFiles } = require("./util/filesUtil");

export function handle(client: any) {
    const folders = getFiles(__dirname + "/events", true);

    for (const folder of folders) {
        const files = getFiles(folder);

        // Ensure name is always defined
        const name = folder.replace(/\\/g, "/").split("/").pop() || "default";

        client.on(name, async (...args: any) => {
            for (const file of files) {
                const eventFunction = require(file);
                await eventFunction(client, ...args);
            }
        });
    }
}
