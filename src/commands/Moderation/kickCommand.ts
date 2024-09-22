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

        const optionsusr = interaction.options.getUser("member");
        const usr = await interaction.guild.members.fetch(optionsusr);
        if (usr.id === interaction.member.id) {
            return await interaction.editReply({ content: `\`❌\` You cannot kick yourself!`})
        } else if (usr.roles.highest.position >= interaction.member.roles.highest.position) {
            return await interaction.editReply({ content: `\`❌\` You cannot kick that member.`})
        }
        const reason = interaction.options.getString("reason") ?? "No reason provided"

        await usr.kick();

        const auditChannel = client.channels.cache.get(getConfig().Moderation.auditChannelID)

        const embed = new EmbedBuilder()
            .setTitle("User Kicked")
            .setColor("Red")
            .setDescription(
                `> User: ${usr.user.username} | <@${usr.id}>\n` +
                `> Reason: ${reason}\n` +
                `> Moderator: ${interaction.user.username}`
            )
            .setTimestamp()

        if (auditChannel) {
            auditChannel.send({ embeds: [embed] })
        }

        return await interaction.editReply({ content: `\`✅\` Kicked **${usr.user.username}** with reason *${reason}*.` })
    }
}