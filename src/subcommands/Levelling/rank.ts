var colorize = require("colorize")
const knex = require("knex")({
    client: "sqlite3",
    connection: {
        filename: "./data.db",
    },
    useNullAsDefault: true
})
const { profileImage } = require("discord-arts");

module.exports = async (client: any, interaction: any) => {
    try {
        const { guild, user, options } = interaction;
        let userId = options.getUser("member") || user;

        const top10 = await knex("levels").where("guild", "=", guild.id).orderBy("totalXP", "desc").limit(10);

        let score = await knex("levels").select("*").where("user", "=", userId.id).where("guild", "=", guild.id).first();
        if (!score) {
            return await interaction.reply({ content: `\`❌\` This user does not have any XP yet.`, ephemeral: true })
        }

        await interaction.deferReply({ ephemeral: false })
        const levelInfo = score.level;
        const nextXP = levelInfo * 2 * 250 + 250
        const xpInfo = score.xp;
        const totalXP = score.totalXP;
        let rank = top10.sort((a: any, b: any) => {
            return b.totalXP - a.totalXP;
        })
        
        let ranking = rank.map((x: any) => x.totalXP).indexOf(totalXP) + 1;
        
        let card = await knex("rankCardTable").select("*").where("user", "=", userId.id).where("guild", "=", guild.id).first();
        if (!card) {
            await knex("rankCardTable").insert({
                id: `${userId.id}-${guild.id}`,
                user: userId.id,
                guild: guild.id,
                textColor: `#beb1b1`,
                barColor: `#838383`,
                backgroundColor: `#36393f`
            }).onConflict("id").merge();
        }

        const today = new Date();
        const month = today.toLocaleString("default", { month: "short" });
        let dd = today.getDate();
        let yyyy = today.getFullYear();
        if (dd < 10) dd = 0 + dd;

        const buffer = await profileImage(userId.id, {
            presenceStatus: userId.client.user.presence.status,
            badgesFrame: true,
            customDate: `${month} ${dd} ${yyyy}`,
            moreBackgroundBlur: true,
            backgroundBrightness: 100,
            rankData: {
                currentXp: xpInfo,
                requiredXp: nextXP,
                rank: ranking,
                level: levelInfo,
                barColor: card.barColor,
                levelColor: card.textColor,
                autoColorRank: true
            }
        })

        return await interaction.editReply({ files: [buffer] })
    } catch (error) {
        console.log(colorize.ansify(`#green[(FerrumC)] #red[An unexpected error occurred when trying to fetch a user's rank: \n${error}]`))
        return await interaction.editReply({ content: `\`❌\` Oops! Something went wrong. Please try again later.`})
    }
}