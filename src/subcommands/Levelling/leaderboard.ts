const { EmbedBuilder } = require("discord.js")
var colorize = require("colorize")
const knex = require("knex")({
    client: "sqlite3",
    connection: {
        filename: "./data.db",
    },
    useNullAsDefault: true
})

module.exports = async (client: any, interaction: any) => {
    try {
        const { guild, user, options } = interaction;
        const page = options.getNumber("page") || 1;

        const currentPage = parseInt(page);
        const top10 = await knex("levels").select("*").where("guild", "=", guild.id).orderBy("totalXP", "desc");

        if (parseFloat(page) > Math.ceil(top10.length / 10)) {
           return await interaction.reply({ content: `\`🚫\` Invalid page number. There are only **${Math.ceil(top10.length / 10)}** pages.`, ephemeral: true })
        }

        const embed = new EmbedBuilder()
            .setTitle("FerrumC Leaderboard")
            .setColor("Blue")
            .setFooter({ text: `Page ${currentPage} / ${Math.ceil(top10.length / 10)}`})

        if (top10.length < 1) {
            embed.setDescription(
                "```\nThere are no users in this leaderboard.\n```"
            )
        }

        var state = {
            'querySet': top10,
            'page': currentPage,
            'rows': 10
        }

        await buildTable()

        function pagination(querySet: any, page: any, rows: any) {
            var trimStart = (page - 1) * rows;
            var trimEnd = trimStart + rows;

            var trimmedData = querySet.slice(trimStart, trimEnd);
            var pages = Math.ceil(querySet.length / rows);

            return {
                'querySet': trimmedData,
                'pages': pages
            }
        }

        async function buildTable() {
            var pagesData = pagination(state.querySet, state.page, state.rows)
            var myList = pagesData.querySet;
            
            for (var i = 1 in myList) {
                let nextXP = myList[i].level * 2 * 250 + 250
                let totalXP = myList[i].totalXP;

                let rank = top10.sort((a: any, b: any) => {
                    return b.totalXP - a.totalXP
                });
                let ranking = rank.map((x: any) => x.totalXP).indexOf(totalXP) + 1;
                let users = myList[i].tag;
                
                embed.addFields({ name: `#${ranking}. ${users}`, value: `> **Level**: \`${myList[i].level}\`\n> **XP**: \`${myList[i].xp} / ${nextXP}\`` });
                
            }

            return await interaction.reply({ embeds: [embed] })
        }
    } catch (error) {
        console.log(colorize.ansify(`#green[(FerrumC)] #red[An unexpected error occurred when processing the levels leaderboard: \n${error}]`))
        return await interaction.reply({ content: `\`❌\` Oops! Something went wrong. Please try again later.`})
    }
}
