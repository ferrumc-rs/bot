const { getConfig } = require("../../util/parsing/configParser")

module.exports = async (client: any, member: any) => {
    const { user, guild } = member;

    const welcomeChannel = guild.channels.cache.get(getConfig().channelID);
    if (!welcomeChannel) return;

    const message = getConfig().message.replace("{user}", user);
    welcomeChannel.send({
        content: message
    })
}