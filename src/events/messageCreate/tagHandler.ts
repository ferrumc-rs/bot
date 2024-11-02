const { EmbedBuilder, Colors } = require("discord.js");

module.exports = async (client: any, message: any) => {
    if (message.author.bot) return;
    if (!message.guild) return;

    if (message.content.toLowerCase().includes("!contributing")) {
        let embed = new EmbedBuilder()
            .setTitle("Contributing")
            .setDescription(
                "Want to Contribute? Read below ^\n" +
                `\`🚀\` We are in the midst of rewriting FerrumC in the **[rewrite/v3 branch](https://github.com/ferrumc-rs/ferrumc/tree/rewrite/v3)**.\n` +
                `\`💡\` If you wish to contribute, please read our [Contributing Guidelines](https://github.com/ferrumc-rs/ferrumc/blob/rewrite/v3/CONTRIBUTING.md) first!\n` +
                `\`📄\` Make sure to check out our [Project](https://github.com/orgs/ferrumc-rs/projects/3), as well as our [GitHub Issues](https://github.com/ferrumc-rs/ferrumc/issues) in order what to do.\n\n` +
                `\`❓\` Have new ideas? Make a post in <#1281566453153140736>.\n` +
                `\`❗\` Ensure you create a post in <#1283468781322240064> when working on a feature!`
            )
            .setColor(Colors.Blue)

        message.reply({ embeds: [embed] })
    } else if (message.content.toLowerCase().includes("!newcontrib")) {

        message.reply({ content:
             `## Make a post in <#1283468781322240064>!\n` + 
             `This lets you ask for help, and we can provide feedback directly.`
            })
    }
}