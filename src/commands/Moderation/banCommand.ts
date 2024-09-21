const { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } = require("discord.js")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ban")
        .setDescription("Ban someone from the server.")
        .addUserOption((o: any) => o
            .setName("member")
            .setDescription("Member to ban.")
            .setRequired(true)
        )
        .addStringOption((o: any) => o
            .setName("duration")
            .setDescription("Duration for ban ('permanent' for perma). Format: 1h = 1hour, 1d = 1day, etc")
            .setRequired(true)
        )
        .addStringOption((o: any) => o
            .setName("reason")
            .setDescription("Reason for ban.")
        )
        .toJSON(),
    
    userPermissions: [ PermissionFlagsBits.BanMember, PermissionFlagsBits.KickMembers ],
    botPermissions: [ PermissionFlagsBits.BanMember, PermissionFlagsBits.KickMembers, PermissionFlagsBits.SendMessages ],
    
    run: async (client: any, interaction: any) => {
        let embed = new EmbedBuilder()
            .setTitle("About FerrumC")
            .setDescription(`FerrumC is a fully multithreaded Minecraft server implementation written in Rust.\n\`💡\` Check out our [GitHub repository](https://github.com/ferrumc-rs/ferrumc)!`)
            .setThumbnail('https://ferrumc.netlify.app/assets/ferrumc-trans.png')

        return await interaction.reply({ embeds: [embed] })
    }
}