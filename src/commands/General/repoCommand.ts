const {
    EmbedBuilder,
    SlashCommandBuilder,
    Colors,
    time,
    TimestampStyles,
    PermissionFlagsBits,
} = require("discord.js");
const { getRepoInfo, getLatest, getBranches } = require("../../util/apiUtil");
const { getMostRecentCommit } = require("../../util/git");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("repo")
        .setDescription("Get data about the FerrumC project."),

    userPermissions: [],
    botPermissions: [PermissionFlagsBits.SendMessages],

    run: async (client: any, interaction: any) => {
        console.log(getMostRecentCommit());
        return;
        await interaction.deferReply();
        let repoInfo = await getRepoInfo();

        let starCount = repoInfo.stargazers_count;
        let codeSize = repoInfo.size;
        let forks = repoInfo.forks;
        let latestCommit = await getLatest();
        let compiledStr = await compile(latestCommit);

        let embed = new EmbedBuilder()
            .setTitle("FerrumC's GitHub")
            .setColor(Colors.Blue)
            .setDescription(
                `Check out our [GitHub repository](https://github.com/ferrumc-rs/ferrumc)!`
            )
            .setFields(
                { name: "Stars", value: `${starCount}`, inline: true },
                {
                    name: "Code Size",
                    value: `${formatBytes(codeSize, 2)}`,
                    inline: true,
                },
                { name: "Forks", value: `${forks}`, inline: true },
                { name: "Latest Commit", value: `${compiledStr}` }
            )
            .setThumbnail(
                "https://ferrumc.netlify.app/assets/ferrumc-trans.png"
            );

        return await interaction.editReply({ embeds: [embed] });
    },
};

function formatBytes(bytes: any, decimals = 2) {
    if (!+bytes) return "0 Bytes";

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = [
        "Bytes",
        "KiB",
        "MiB",
        "GiB",
        "TiB",
        "PiB",
        "EiB",
        "ZiB",
        "YiB",
    ];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

async function compile(latest: any) {
    if (!latest || JSON.stringify(latest) === "{}") return "N/A";
    let branches = await getBranches();
    for (let i = 0; i < branches.length; i++) {
        if (branches[i].commit.sha === latest.sha) {
            let date = new Date(latest.commit.committer.date);
            let timestring = time(date);
            return `[ferrumc:${branches[i].name}]: ["${
                latest.commit.message
            }"](${latest.html_url}) - ${latest.commit.committer.name} | ${time(
                date,
                TimestampStyles.RelativeTime
            )}`;
        }
    }
}
