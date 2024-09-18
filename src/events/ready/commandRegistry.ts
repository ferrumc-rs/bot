let colorize = require("colorize")

const { getLocalCommands, getCommands, compareCommands } = require("../../util/commandsUtil")

module.exports = async (client: any) => {
    try {
        const locCommands = getLocalCommands();
        const appCommands = await getCommands(client, process.env.GUILD_ID)

        for (const command of locCommands) {
            const { data } = command;

            const cmdName = data.name;
            const cmdDesc = data.description;
            const cmdOptions = data.options;

            const exCommand = await appCommands.cache.find((command: any) => command.name === cmdName);

            if (exCommand) {
                if (command.deleted) {
                    await appCommands.delete(exCommand.id);
                    console.log(colorize.ansify(`#green[(FerrumC)] #red[Deleted application command] #yellow[${cmdName}]#red[.]`))

                    continue;
                }

                if (compareCommands(exCommand, command)) {
                    await appCommands.edit(exCommand.id, { name: cmdName, description: cmdDesc, options: cmdOptions });

                    console.log(colorize.ansify(`#green[(FerrumC)] #gray[Edited application command] #yellow[${cmdName}]#gray[.]`))
                }
            } else {
                if (command.deleted) {
                    continue;
                }

                await appCommands.create({ name: cmdName, description: cmdDesc, options: cmdOptions });
                console.log(colorize.ansify(`#green[(FerrumC)] #yellow[Registered application command] #green[${cmdName}]#yellow[.]`))
            }
        }
    } catch (e) {
        console.log(colorize.ansify(`#green[(FerrumC)] #red[An unexpected error occurred when registering commands: \n${e}]`))
    }
}