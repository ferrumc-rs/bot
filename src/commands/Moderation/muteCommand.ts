const { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder, time, TimestampStyles } = require("discord.js")
const { getConfig } = require("../../util/parsing/configParser")
var ms = require("ms")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("mute")
        .setDescription("Mute someone.")
        .addUserOption((o: any) => o
            .setName("member")
            .setDescription("Member to mute.")
            .setRequired(true)
        )
        .addStringOption((o: any) => o
            .setName("duration")
            .setDescription("Duration for mute. Format: 1h = 1hour, 1d = 1day, etc")
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
        if (usr.id === interaction.member.id) {
            return await interaction.editReply({ content: `\`❌\` You cannot mute yourself!`})
        } else if (usr.roles.highest.position >= interaction.member.roles.highest.position) {
            return await interaction.editReply({ content: `\`❌\` You cannot mute that member.`})
        }
        const reason = interaction.options.getString("reason") ?? "No reason provided"
        const duration = interaction.options.getString("duration")
        const auditChannel = client.channels.cache.get(getConfig().Moderation.auditChannelID)

        const embed = new EmbedBuilder()
            .setTitle("User Muted")
            .setColor("Red")
            .setTimestamp()

        if (duration) {
            let formatted: number;
            try {
                formatted = ms(duration)
            } catch (error: any) {
                console.log(error);
                return await interaction.editReply({ content: `\`❌\` You must specify a correct duration (e.g. '1d' = 1 day).`})
            }

            usr.timeout(formatted);
            embed.setDescription(
                `> User: ${usr.user.username} | <@${usr.id}>\n` +
                `> Reason: ${reason}\n` +
                `> Moderator: ${interaction.user.username}\n` +
                `> Unmute in: ${time((new Date(Date.now() + formatted)), TimestampStyles.RelativeTime)}`
            )

            await interaction.editReply({ content: `\`✅\` Muted **${usr.user.username}** with reason *${reason}* (Unmute in ${time((new Date(Date.now() + formatted)), TimestampStyles.RelativeTime)})` })
        } else {
            usr.timeout();
            embed.setDescription(
                `> User: ${usr.user.username} | <@${usr.id}>\n` +
                `> Reason: ${reason}\n` +
                `> Moderator: ${interaction.user.username}`
            )

            await interaction.editReply({ content: `\`✅\` Muted **${usr.user.username}** with reason *${reason}*.`})
        }

        if (auditChannel) {
            auditChannel.send({ embeds: [embed] })
        }
    }
}