const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const configParser = require("../../util/parsing/configParser");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("reload")
        .setDescription("Reloads the parsing support configs."),

    userPermissions: [PermissionFlagsBits.ManageGuild],
    botPermissions: [ PermissionFlagsBits.SendMessages ],

    run: async (client: any, interaction: any) => {

        await interaction.deferReply();

        configParser.loadYAML();

        await interaction.editReply({ content: `\`✅\` Parsing configs reloaded.` })
    }
}