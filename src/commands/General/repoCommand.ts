const {
  EmbedBuilder,
  SlashCommandBuilder,
  Colors,
  time,
  TimestampStyles,
  PermissionFlagsBits,
} = require("discord.js");
const {
  getMostRecentCommit,
  getStars,
  getForks,
  getCommits,
} = require("../../util/git");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("repo")
    .setDescription("Get data about the FerrumC project."),

  userPermissions: [],
  botPermissions: [PermissionFlagsBits.SendMessages],

  run: async (client: any, interaction: any) => {
    await interaction.deferReply();

    let [mostRecentCommit, stars, forks, commits] = await Promise.all([
      getMostRecentCommit(),
      getStars(),
      getForks(),
      getCommits(),
    ]);

    let embed = new EmbedBuilder()
      .setTitle("FerrumC's GitHub")
      .setColor(Colors.Blue)
      .setDescription(
        `Check out our [GitHub repository](https://github.com/ferrumc-rs/ferrumc)!`
      )
      .setFields(
        { name: "Stars", value: `${stars}`, inline: true },
        {
          name: "Commits",
          value: `${commits}`,
          inline: true,
        },
        { name: "Forks", value: `${forks}`, inline: true },
        { name: "Latest Commit", value: `${mostRecentCommit}` }
      )
      .setThumbnail("https://ferrumc.netlify.app/assets/ferrumc-trans.png");

    return await interaction.editReply({ embeds: [embed] });
  },
};
