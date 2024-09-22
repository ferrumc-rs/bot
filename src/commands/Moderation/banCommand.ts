const { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder, time, TimestampStyles } = require("discord.js")
const { addTempBanEntry } = require("../../util/sqlHandler");
var ms = require("ms")
const { getConfig } = require("../../util/parsing/configParser")

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
        )
        .addStringOption((o: any) => o
            .setName("reason")
            .setDescription("Reason for ban.")
        )
        .toJSON(),

    userPermissions: [PermissionFlagsBits.BanMembers, PermissionFlagsBits.KickMembers],
    botPermissions: [PermissionFlagsBits.BanMembers, PermissionFlagsBits.KickMembers, PermissionFlagsBits.SendMessages],

    run: async (client: any, interaction: any) => {
        await interaction.deferReply();

        const usr = interaction.options.getUser("member");

        if (usr.id === interaction.user.id) {
            return await interaction.editReply({ content: `\`❌\` You cannot kick yourself!`})
        } else if (usr.roles.highest.position >= interaction.user.roles.highest.position) {
            return await interaction.editReply({ content: `\`❌\` You cannot ban that member.`})
        }

        const reason = interaction.options.getString("reason") ?? "No reason provided"
        const duration = interaction.options.getString("duration")
        if (duration) {
            let formatted: number;
            try {
                formatted = ms(duration)
            } catch (error: any) {
                console.log(error)
                return await interaction.editReply({ content: `\`❌\` You must specify a correct duration (e.g. '1d' = 1 day).` })
            }

            interaction.guild.members.ban(usr)
            await addTempBanEntry(client, usr.id, usr.username, reason, interaction.user.username, interaction.guild.id, Date.now(), (Date.now() + formatted))

            const future = new Date(Date.now() + formatted);
            await interaction.editReply({ content: `\`✅\` Temporarily banned **${usr.username}** with reason *${reason}*. (Unban in ${time(future, TimestampStyles.RelativeTime)})` })
        } else {
            const auditChannel = client.channels.cache.get(getConfig().Moderation.auditChannelID)

            interaction.guild.members.ban(usr)
            await interaction.editReply({ content: `\`✅\` Permanently banned **${usr.username}** with reason *${reason}*.` })

            const embed = new EmbedBuilder()
                .setTitle("Permanent Ban")
                .setColor("Red")
                .setDescription(
                    `> User: ${name} | <@${usr.id}>\n` +
                    `> Reason: ${reason}\n` +
                    `> Moderator: ${interaction.user.username}`
                )
                .setTimestamp()

            if (auditChannel) {
                auditChannel.send({ embeds: [embed] })
            }
        }
    }
}