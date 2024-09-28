var colorize = require("colorize")
const talkedRecently = new Map();

const { EmbedBuilder } = require("discord.js")

const knex = require("knex")({
    client: "sqlite3",
    connection: {
        filename: "./data.db",
    },
    useNullAsDefault: true
})
const { getConfig } = require("../../util/parsing/configParser")

module.exports = async (client: any, message: any) => {
    if (!message) return;

    let getXpfromDB = getConfig().Levels.xpPerMessage ?? 16;
    let getCooldownfromDB = getConfig().Levels.cooldown ?? 1000;

    try {
        if (message.author.bot || !message.guild || message.content.length < 4) return;

        let card = await knex("rankCardTable").select("*").where("user", "=", message.author.id).where("guild", "=", message.guild.id).first();
        if (!card) {
            await knex("rankCardTable").insert({
                id: `${message.author.id}-${message.guild.id}`,
                user: message.author.id,
                guild: message.guild.id,
                textColor: `#beb1b1`,
                barColor: `#838383`,
                backgroundColor: `#36393f`
            }).onConflict("id").merge();
        }

        let isBlacklisted = await knex("blacklistTable").select("id").where("id", "=", `${message.guild.id}-${message.author.id}`).first() || await knex("blacklistTable").select("id").where("id", "=", `${message.guild.id}-${message.channel.id}`).first()
        if (isBlacklisted) return;

        var level = await knex("levels").select("*").where("user", "=", message.author.id).where("guild", "=", message.guild.id).first()
        if (!level) {
            await knex("levels").insert({
                id: `${message.author.id}-${message.guild.id}`,
                user: message.author.id,
                guild: message.guild.id,
                xp: 0,
                level: 0,
                totalXP: 0,
                tag: message.author.tag
            }).onConflict("id").merge();

            level = await knex("levels").select("*").where("user", "=", message.author.id).where("guild", "=", message.guild.id).first();
        }

        let customSettings = await knex("settings").select("*").where("guild", "=", message.guild.id).first();
        const lvl = level.level;

        if (customSettings) {
            getXpfromDB = customSettings.customXP;
            getCooldownfromDB = customSettings.customCooldown;
        }
        const generatedXP = Math.floor(Math.random() * getXpfromDB);
        const nextXP = level.level * 2 * 250 + 250;

        if (talkedRecently.get(message.author.id)) {
            return;
        } else {
            level.xp += generatedXP;
            level.totalXP += generatedXP;

            let embed;
            if (level.xp >= nextXP) {
                level.xp = 0;
                level.level += 1;

                let embedColor = getConfig().Levels.levelUpEmbedColor;
                let embedDesc = antonymsLevelUp(getConfig().Levels.levelUpEmbedDesc, message, level);
                embed = new EmbedBuilder()
                    .setAuthor({ name: message.author.displayName, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                    .setDescription(embedDesc)
                    .setColor(embedColor)
                    .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
                    .setTimestamp();

                let channelID = getConfig().Levels.levelUpChannelID;
                const hasPingsOff = await knex("turnoffpings").select("*").where("id", "=", message.author.id).first();
                try {
                    if (channelID == "Default") {
                        message.channel.send({ content: `${hasPingsOff ? message.author : ""}`, embeds: [embed] });
                    } else {
                        let channel = message.guild.channels.cache.get(channelID);
                        if (channel) {
                            channel.send({ content: `${hasPingsOff ? message.author : ""}`, embeds: [embed] })
                        }
                    }
                } catch (err) {
                    if (channelID == "Default") {
                        message.channel.send({ content: `${hasPingsOff ? message.author : ""}`, embeds: [embed] })
                    } else {
                        let channel = message.guild.channels.cache.get(channelID);
                        if (channel) {
                            channel.send({ content: `${hasPingsOff ? message.author : ""}`, embeds: [embed] })
                        }
                    }
                }
            }
        }

        await knex('levels')
            .insert({
                id: level.id,
                user: level.user,
                guild: level.guild,
                xp: level.xp,
                level: level.level,
                totalXP: level.totalXP,
                tag: level.tag
            })
            .onConflict("id")
            .merge();

        talkedRecently.set(message.author.id, Date.now() + getCooldownfromDB);
        setTimeout(() => talkedRecently.delete(message.author.id));

        const member = message.member;
        let roles = await knex("roles").select("*").where("guildID", "=", message.guild.id).where("level", "=", lvl).first();
        if (!roles) return;

        if (lvl >= roles.level) {
            if (roles) {
                if (member.roles.cache.get(roles.roleID)) return;

                member.roles.add(roles.roleID);
            }
        }
    } catch (error) {
        console.log(colorize.ansify(`#green[(FerrumC)] #red[An unexpected error occurred when managing chat levelling: \n${error}]`))
    }
}


function antonymsLevelUp(string: any, message: any, level: any) {
    return string
        .replace(/{user}/i, `${message.member}`)
        .replace(/{level}/i, `${level.level}`)
        .replace("<br>", "\n");
}