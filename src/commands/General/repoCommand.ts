const { EmbedBuilder, SlashCommandBuilder, Colors } = require("discord.js")
const { getRepoInfo } = require("../../util/apiUtil")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("repo")
        .setDescription("Get data about the FerrumC project."),
    
    userPermissions: [],
    botPermissions: [],

    run: async (client: any, interaction: any) => {
        await interaction.deferReply();
        let repoInfo = await getRepoInfo();

        let starCount = repoInfo.stargazers_count;
        let codeSize = repoInfo.size;
        let forks = repoInfo.forks;

        let embed = new EmbedBuilder()
            .setTitle("FerrumC GitHub")
            .setColor(Colors.Blue)
            .setDescription(`Check out our [GitHub repository](https://github.com/ferrumc-rs/ferrumc)!`)
            .setFields(
                { name: "Stars", value: `${starCount}`, inline: true },
                { name: "Code Size", value: `${formatBytes(codeSize, 2)}`, inline: true},
                { name: "Forks", value: `${forks}`, inline: true}
            )
            .setThumbnail('https://ferrumc.netlify.app/assets/ferrumc-trans.png')

        return await interaction.editReply({ embeds: [embed] })
    }
}

function formatBytes(bytes: any, decimals = 2) {
    if (!+bytes) return '0 Bytes'

    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB']

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}