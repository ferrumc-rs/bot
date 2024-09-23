const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("level")
        .setDescription("All commands related to the level system.")
        .addSubcommand((subcommand: any) => subcommand
            .setName("rank")
            .setDescription("Get the XP rank of yourself or another user.")
            .addUserOption((user: any) => user
                .setName("member")
                .setDescription("The user to get the rank of. Leaving this blank fetches your own rank.")
            )
        )
        .addSubcommand((subcommand: any) => subcommand
            .setName("leaderboard")
            .setDescription("View the levels leaderboard.")
            .addNumberOption((option: any) => option
                .setName("page")
                .setDescription("Page of leaderboard.")
                .setMinValue(0)
                .setRequired(false)
            )
        )
        .toJSON(),
    
    userPermissions: [],
    botPermissions: [ PermissionFlagsBits.AttachFiles ],

    run: async (client: any, interaction: any) => {
        const sub = interaction.options.getSubcommand();
        const requiredSubcommand = require(`../../subcommands/Levelling/${sub}`);
        await requiredSubcommand(client, interaction);
    }
}