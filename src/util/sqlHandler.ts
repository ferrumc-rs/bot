const { EmbedBuilder, time, TimestampStyles } = require("discord.js")
var colorize = require('colorize');
const knex = require("knex")({
    client: "sqlite3",
    connection: {
        filename: "./data.db",
    },
    useNullAsDefault: true
})
const { getConfig } = require("./parsing/configParser")

var timer: any = null;

var loopBans = async function (client: any) {
    try {
        const result = await knex("tempbans").select();

        result.forEach(async (row: any) => {
            if (Date.now() >= row.unbanTime) {
                console.log(colorize.ansify(`#green[(FerrumC)] #grey[Unbanning User ] #yellow[${row.id}] #grey[.]`))

                const guild = client.guilds.cache.get(row.serverID);
                const auditChannel = client.channels.cache.get(getConfig().Moderation.auditChannelID)
                if (guild && auditChannel) {
                    let id = row.id;
                    await knex('tempbans').del({ id });

                    guild.members.fetch(row.id).then((member: any) => {
                        guild.members.unban(member);

                        console.log(colorize.ansify(`#green[(FerrumC)] #green[Unbanned User ] #yellow[${row.id}] #grey[.]`))

                        let embed = new EmbedBuilder()
                            .setTitle("Unban")
                            .setColor("Green")
                            .setDescription(
                                `> User: ${row.name} | <@${row.id}>\n` +
                                `> Reason: ${row.reason}\n` +
                                `> Moderator: ${row.moderatorName}`
                            )
                            .setTimestamp()

                        auditChannel.send({ embeds: [embed] })
                    })


                } else {
                    console.log(colorize.ansify(`#green[(FerrumC)] #red[Failed to find guild in client cache of ID] #yellow[${row.serverID}] #red[.]`))
                }
            }
        })
    } catch (e) {
        console.log(colorize.ansify(`#green[(FerrumC)] #red[An unexpected error occurred when looping through tempbans: \n${e}]`))
    }
}

export async function removeTempBan(id: any) {
    try {
        const count = await knex('tempbans')
            .where({ id })
            .count();

        if (parseInt(count[0]['count(*)']) > 0) {
            console.log(colorize.ansify(`#green[(FerrumC)] #grey[Removing temporary ban entry for] #yellow[${id}] #grey[.]`))
        }
    } catch (error: any) {
        console.log(error);
    }
}

export async function addTempBanEntry(client: any, id: any, name: any, reason: any, moderatorName: any, serverID: any, banTime: any, futureTime: any) {

    await knex("tempbans").insert({ id: id, name: name, reason: reason, moderatorName: moderatorName, serverID: serverID, banTime: banTime, unbanTime: futureTime })

    const auditChannel = client.channels.cache.get(getConfig().Moderation.auditChannelID)
    let unbanDate = new Date(futureTime);
    const embed = new EmbedBuilder()
        .setTitle("Ban")
        .setColor("Red")
        .setDescription(
            `> User: ${name} | <@${id}>\n` +
            `> Reason: ${reason}\n` +
            `> Moderator: ${moderatorName}\n` +
            `> Unban in: ${time(unbanDate, TimestampStyles.RelativeTime)}`
        )
        .setTimestamp()

    if (auditChannel) {
        auditChannel.send({ embeds: [embed] })
    }
}

export async function start(client: any) {
    try {
        console.log(colorize.ansify(`#green[(FerrumC)] #blue[Initialising SQLite System...]`))

        await knex.schema.hasTable("tempbans").then(async function (exists: any) {
            if (!exists) {
                await knex.schema
                    .createTable("tempbans", (table: any) => {
                        table.string("id")
                        table.string("name")
                        table.string("reason")
                        table.string("moderatorName")
                        table.string("serverID")
                        table.integer("banTime")
                        table.integer("unbanTime")
                    })

            }
        })

        timer = setInterval(async () => {
            await loopBans(client);
        }, 10000);
    } catch (e) {
        console.log(e)
    }
}