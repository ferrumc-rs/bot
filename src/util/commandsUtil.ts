
const path = require("node:path")
const { getFiles } = require("./filesUtil")

export function compareCommands(existing: any, local: any) {
    const hasChanged = (a: any, b: any) => JSON.stringify(a) !== JSON.stringify(b);

    if (hasChanged(existing.name, local.data.name) || hasChanged(existing.description || undefined, local.data.description || undefined)) return true;

    const changedOptions = hasChanged(
        optionsArray(existing),
        optionsArray(local.data)
    );

    return changedOptions;

    function optionsArray(command: any) {
        const clean = (object: any) => {
            for (const key in object) {

                if (typeof object[key] === "object") {
                    clean(object[key]);
                    if (!object[key] || Array.isArray(object[key]) && !object[key].length) delete object[key];
                } else if (object[key] === undefined) delete object[key];

            }
        }

        const norm = (stream: any): any[] | Record<string, any> => {
            if (Array.isArray(stream)) {
                return stream.map((item: any) => norm(item));
            }
        
            const normItem = {
                type: stream.type,
                name: stream.name,
                description: stream.description,
                options: stream.options ? norm(stream.options) : undefined,
                required: stream.required,
            };
        
            return [normItem];
        };

        return (command.options || []).map((option: any) => {
            let opt = JSON.parse(JSON.stringify(option));
            opt.options ? (opt.options = norm(opt.options)) : (opt = norm(opt));
            clean(opt);
            return {...opt, choices: opt.choices ? strChoices(opt.choices) : null};
        });

        function strChoices(choices: any) { return JSON.stringify(choices.map((choice: any) => choice.value ))};
    }
}

export async function getCommands(client: any, id: any) {
    let commands;
    
    if (id) {
        const guild = await client.guilds.fetch(id);
        commands = guild.commands;
    } else {
        if (client.application) {
            commands = await client.application.commands;
        } else {
            throw new Error('Client application is not available');
        }
    }

    await commands.fetch({ guildId: id });
    return commands;
}

export function getLocalCommands(exceptions: string[] = []) {
    let commands = [];
    const categories = getFiles(path.join(__dirname, "..", "commands"), true);
    
    for (const category of categories) {
        const files = getFiles(category);
        
        for (const file of files) {
            const obj = require(file);
            
            if (exceptions.includes(obj.name)) continue;
            commands.push(obj);
        }
    }
    
    return commands;
}
