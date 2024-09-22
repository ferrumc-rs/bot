const { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder, time, TimestampStyles } = require("discord.js")
const { getConfig } = require("../../util/parsing/configParser")
var ms = require("ms")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("unmute")
        .setDescription("Remove a timeout / mute from someone.")
        .addUserOption((o: any) => o
            .setName("member")
            .setDescription("Member to unmute.")
            .setRequired(true)
        )
        .addStringOption((o: any) => o
            .setName("reason")
            .setDescription("Reason for the kick.")
        )
        .toJSON(),

    userPermissions: [PermissionFlagsBits.MuteMembers],
    botPermissions: [PermissionFlagsBits.MuteMembers, PermissionFlagsBits.SendMessages],

    run: async (client: any, interaction: any) => {
        await interaction.deferReply();

        const optionsusr = interaction.options.getUser("member");
        const usr = await interaction.guild.members.fetch(optionsusr);
    
        const reason = interaction.options.getString("reason") ?? "No reason provided"
        const auditChannel = client.channels.cache.get(getConfig().Moderation.auditChannelID)

        const embed = new EmbedBuilder()
            .setTitle("User Unmuted")
            embed.setDescription(
                `> User: ${usr.user.username} | <@${usr.id}>\n` +
                `> Reason: ${reason}\n` +
                `> Moderator: ${interaction.user.username}`
            )
            .setColor("Green")
            .setTimestamp()

        usr.timeout(null)

        if (auditChannel) {
            auditChannel.send({ embeds: [embed] })
        }
    }
}