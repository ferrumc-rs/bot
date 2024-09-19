var colorize = require('colorize');
var discordHandler = require("../../util/parsing/discordHandler");
var configParser = require("../../util/parsing/configParser")

module.exports = async (client: any, message: any) => {
    if (message.author.bot) return;
    if (!message.guild) return;
    if (!configParser.getConfig().enabled) return;

    let listeningChannels = configParser.getConfig().listening_channels;
    if (!listeningChannels.includes(message.channel.id)) return;

    const data = await discordHandler.handleDiscord(message.content, message.attachments);
    if (data === null) {
        return hasMentioned(message, client);
    }

    message.reply({ content: data.message });
    data.reactions.forEach((reaction: any) => {
        message.react(reaction);
    })
}

function hasMentioned(message: any, client: any) {
    if (message.mentions.has(client.user)) {
        const mentionData = configParser.getConfig().mentions.mention;
        mentionData.reactions.forEach((reaction: any) => {
            message.react(reaction);
        })
    }
}