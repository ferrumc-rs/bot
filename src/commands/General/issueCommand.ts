const { EmbedBuilder, Colors, PermissionFlagsBits, SlashCommandBuilder } = require("discord.js")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("issue")
        .setDescription("Get instructions for creating an issue on FerrumC."),

    userPermissions: [],
    botPermissions: [ PermissionFlagsBits.SendMessages ],

    run: async (client: any, interaction: any) => {
        let embed = new EmbedBuilder()
            .setTitle("Need to file an issue?")
            .setDescription(
                `Follow the quick guide on our issue page before submitting:\n` +
                `\`1\` Check existing issues or the project board to avoid duplicates.\n` +
                `\`2\` Pick the right template and include logs, versions, and repro steps.\n` +
                `\`3\` Open the form here: [Issue Instructions](https://github.com/ferrumc-rs/ferrumc/issues/new/choose).`
            )
            .setColor(Colors.Blue)
            .setThumbnail('https://ferrumc.netlify.app/assets/ferrumc-trans.png')

        return await interaction.reply({ embeds: [embed] })
    }
}
