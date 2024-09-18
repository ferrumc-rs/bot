const { EmbedBuilder } = require("discord.js")

const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("info")
        .setDescription("Get information concerning FerrumC."),
    
    userPermissions: [],
    botPermissions: [],

    run: async (client: any, interaction: any) => {
        let embed = new EmbedBuilder()
            .setTitle("About FerrumC")
            .setDescription(`FerrumC is a fully multithreaded Minecraft server implementation written in Rust.\n\`💡\` Check out our [GitHub repository](https://github.com/ferrumc-rs/ferrumc)!`)
            .addFields(
                { name: "Released", value: "9th September 2024" }
            )

        return await interaction.reply({ embeds: [embed] })
    }
}