const { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } = require("discord.js")
const { removeTempBan } = require("../../util/sqlHandler");
const { getConfig } = require("../../util/parsing/configParser")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("unban")
        .setDescription("Unban someone.")
        .addUserOption((o: any) => o
            .setName("member")
            .setDescription("Member to unban (ID of user)")
            .setRequired(true)
        )
        .addStringOption((o: any) => o
            .setName("reason")
            .setDescription("Reason for the unban.")
        )
        .toJSON(),

    userPermissions: [PermissionFlagsBits.BanMembers, PermissionFlagsBits.KickMembers],
    botPermissions: [PermissionFlagsBits.BanMembers, PermissionFlagsBits.KickMembers, PermissionFlagsBits.SendMessages],

    run: async (client: any, interaction: any) => {
        await interaction.deferReply();

        const usr = interaction.options.getUser("member");
        const reason = interaction.options.getString("reason") ?? "No reason provided"

        await interaction.guild.bans.fetch().then(async (bans: any) => {
            if (bans.size == 0) return await interaction.editReply({ content: `\`❌\` There are no bans on this server!` })
            let bannedID = bans.find((ban: any) => ban.user.id == usr.id);
            if (!bannedID) return await interaction.editReply({ content: `\`❌\` This user is not banned from this server.` })

            await removeTempBan(usr.id)
            await interaction.guild.bans.remove(usr, reason).catch((err: any) => {
                console.log(err)
                return interaction.editReply({ content: `\`❌\` Failed to unban user.` })
            })
            await interaction.editReply({ content: `\`✅\` Unbanned **${usr.id}** with reason *${reason}*.` })

            const auditChannel = client.channels.cache.get(getConfig().Moderation.auditChannelID)

            const embed = new EmbedBuilder()
                .setTitle("Unban")
                .setColor("Green")
                .setDescription(
                    `> User: ${usr.username} | <@${usr.id}>\n` +
                    `> Reason: ${reason}\n` +
                    `> Moderator: ${interaction.user.username}`
                )
                .setTimestamp()

            if (auditChannel) {
                auditChannel.send({ embeds: [embed] })
            }
        })
    }
}