const { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } = require("discord.js")
const { getConfig } = require("../../util/parsing/configParser")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("kick")
        .setDescription("Kick someone.")
        .addUserOption((o: any) => o
            .setName("member")
            .setDescription("Member to kick.")
            .setRequired(true)
        )
        .addStringOption((o: any) => o
            .setName("reason")
            .setDescription("Reason for the kick.")
        )
        .toJSON(),

    userPermissions: [PermissionFlagsBits.KickMembers],
    botPermissions: [PermissionFlagsBits.KickMembers, PermissionFlagsBits.SendMessages],

    run: async (client: any, interaction: any) => {
        await interaction.deferReply();

        const usr = interaction.options.getUser("member");
        if (usr.id === interaction.user.id) {
            return await interaction.editReply({ content: `\`❌\` You cannot kick yourself!`})
        } else if (usr.roles.highest.position >= interaction.user.roles.highest.position) {
            return await interaction.editReply({ content: `\`❌\` You cannot ban that member.`})
        }
        const reason = interaction.options.getString("reason") ?? "No reason provided"

        await usr.kick();

        const auditChannel = client.channels.cache.get(getConfig().Moderation.auditChannelID)

        const embed = new EmbedBuilder()
            .setTitle("User Kicked")
            .setColor("Red")
            .setDescription(
                `> User: ${usr.username} | <@${usr.id}>\n` +
                `> Reason: ${reason}\n` +
                `> Moderator: ${interaction.user.username}`
            )
            .setTimestamp()

        if (auditChannel) {
            auditChannel.send({ embeds: [embed] })
        }

        return await interaction.editReply({ content: `\`✅\` Kicked **${usr.username}** with reason *${reason}*.` })
    }
}