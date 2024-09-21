const { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } = require("discord.js")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("info")
        .setDescription("Get information concerning FerrumC."),
    
    userPermissions: [],
    botPermissions: [ PermissionFlagsBits.SendMessages ],
    
    run: async (client: any, interaction: any) => {
        let embed = new EmbedBuilder()
            .setTitle("About FerrumC")
            .setDescription(`FerrumC is a fully multithreaded Minecraft server implementation written in Rust.\n\`💡\` Check out our [GitHub repository](https://github.com/ferrumc-rs/ferrumc)!`)
            .setThumbnail('https://ferrumc.netlify.app/assets/ferrumc-trans.png')

        return await interaction.reply({ embeds: [embed] })
    }
}