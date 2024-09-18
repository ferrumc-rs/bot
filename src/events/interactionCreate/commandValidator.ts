var colorize = require('colorize');

const { EmbedBuilder } = require("discord.js");
const commandsUtil = require("../../util/commandsUtil");

module.exports = async (client: any, interaction: any) => {
    if (!interaction.isChatInputCommand()) return;
    const locCommands = commandsUtil.getLocalCommands();

    try {
        const obj = locCommands.find((command: any) => command.data.name === interaction.commandName);
        if (!obj) return;

        if (obj.userPermissions?.length) {
            for (const permission of obj.userPermissions) {
                if (interaction.member.permissions.has(permission)) continue;

                const embed = new EmbedBuilder()
                    .setColor("Red")
                    .setDescription(`\`❌\` You do not have the sufficient permissions for this command!`)

                return interaction.reply({ embeds: [embed] });
            }
        }

        if (obj.botPermissions?.length) {
            for (const permission of obj.botPermissions) {
                const bot = interaction.guild.members.me;
                if (bot.permissions.has(permission)) continue;

                const embed = new EmbedBuilder()
                    .setColor("Red")
                    .setDescription(`\`❓\` I don't have sufficient permissions to run this command.`)

                return interaction.reply({ embeds: [embed] });
            }
        }

        await obj.run(client, interaction);
    } catch (e) {
        console.log(colorize.ansify(`#green[(FerrumC)] #red[An unexpected error occurred when validating commands: \n${e}]`))
    }
}