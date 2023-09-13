import { Collection, Message, PartialMessage, Permissions } from "discord.js"
import { Database } from "better-sqlite3"
import i18next from "i18next"
import checkBanwords from "../lib/banwords/check_banwords"
import removeDeletedRolesRewards from "../lib/rolerewards/remove_deleted_roles_rewards"
import { Kirino } from "../lib/misc/types"
import { Afk, Language, XpBlacklistedChannel, XpBlacklistedRole, XpGuild, XpProfile, XpRole } from "../lib/misc/database"

const t = i18next.t.bind(i18next)

export function eventHandler(bot: Kirino) {
    bot.on("messageCreate", async msg => {
        if (msg.author.bot || msg.guild && !msg.guild.me?.permissions.has(Permissions.FLAGS.SEND_MESSAGES)) return

        const queryResult = bot.db.prepare("SELECT * FROM languages WHERE id = ?").get(msg.guild ? msg.guild.id : msg.author.id) as Language | undefined
        const lang = queryResult ? queryResult.language : "en"
        await i18next.changeLanguage(lang)

        checkAfk(bot, msg)
        checkBanwords(bot, msg)
        handleXp(bot, msg, bot.xpCooldowns)
    })
}

// ------------------------------------------------------------- utility functions

function checkAfk(bot: Kirino, msg: Message | PartialMessage) {
    if (!msg.author) return
    const mentions = msg.mentions.users

    const afkRequest = bot.db.prepare("SELECT * FROM afk WHERE user_id = ?")

    for (const mention of mentions.values()) {
        const mentionnedAfkRow = afkRequest.get(mention.id) as Afk | undefined

        if (mentionnedAfkRow !== undefined) {
            if (mentionnedAfkRow.user_id !== msg.author.id) {
                if (mentionnedAfkRow.reason) {
                    msg.channel.send(`**${mention.username}**` + t("messageCreate:afk_with_reason") + mentionnedAfkRow.reason)
                }
                else {
                    msg.channel.send(`**${mention.username}**` + t("messageCreate:afk_without_reason"))
                }
            }
        }
    }

    const selfAfkRow = afkRequest.get(msg.author.id)

    if (selfAfkRow !== undefined) {
        const deletionRequest = bot.db.prepare("DELETE FROM afk WHERE user_id = ?")
        deletionRequest.run(msg.author.id)
        msg.reply(t("messageCreate:deleted_from_afk")).then(afkMsg => setTimeout(() => afkMsg.delete().catch(), 5000)).catch()
    }
}

async function handleXp(bot: Kirino, msg: Message | PartialMessage, cooldowns: Collection<string, Collection<string, number>>) {
    if (msg.guild && msg.member && msg.author) {
        const xpMetadataRequest = bot.db.prepare("SELECT is_enabled, level_up_message FROM xp_guilds WHERE guild_id = ?")
        const xpMetadata = xpMetadataRequest.get(msg.guild.id) as XpGuild | undefined

        let isEnabled
        let levelUpMsg
        if (xpMetadata) {
            isEnabled = xpMetadata.is_enabled
            levelUpMsg = xpMetadata.level_up_message
        }

        const blacklistedChannelsRequest = bot.db.prepare("SELECT channel_id FROM xp_blacklisted_channels WHERE guild_id = ?")
        const blacklistedChannels = blacklistedChannelsRequest.all(msg.guild.id) as XpBlacklistedChannel[]
        let isBlacklistedChannel = false
        if (blacklistedChannels.map(row => row.channel_id).find(channel_id => channel_id === msg.channel.id) !== undefined) {
            isBlacklistedChannel = true
        }

        const blacklistedRolesRequest = bot.db.prepare("SELECT role_id FROM xp_blacklisted_roles WHERE guild_id = ?")
        const blacklistedRoles = blacklistedRolesRequest.all(msg.guild.id) as XpBlacklistedRole[]
        const memberRoles = [...msg.member.roles.cache.values()].map(role => role.id)
        let hasBlacklistedRole = false

        for (const row of blacklistedRoles) {
            if (memberRoles.includes(row.role_id)) hasBlacklistedRole = true
        }

        if (!cooldowns.has(msg.guild.id)) {
            cooldowns.set(msg.guild.id, new Collection())
        }
        let isReady = true

        const now = Date.now()
        const timestamps = cooldowns.get(msg.guild.id) as Collection<string, number>
        const timestamp = timestamps.get(msg.author.id)
        const cooldown = 60_000 // 1 minute cooldown

        if (timestamp) {
            const expiration = timestamp + cooldown
            if (now < expiration) {
                isReady = false
            }
        }

        timestamps.set(msg.author.id, now)
        setTimeout(() => msg.author && timestamps.delete(msg.author.id), cooldown)

        if (isEnabled && isReady && !isBlacklistedChannel && !hasBlacklistedRole) {
            const xpRequest = bot.db.prepare("SELECT * FROM xp_profiles WHERE guild_id = ? AND user_id = ?")
            let xpRow = xpRequest.get(msg.guild.id, msg.author.id) as XpProfile | undefined

            if (xpRow === undefined) {
                xpRow = { guild_id: msg.guild.id, user_id: msg.author.id, xp: 0, total_xp: 0, level: 0, color: undefined, background: undefined }
            }

            const currentXp = xpRow.xp
            const currentLvl = xpRow.level

            if (currentLvl < 100) {
                const scaleRequest = bot.db.prepare("SELECT scale FROM xp_guilds WHERE guild_id = ?")
                let row = scaleRequest.get(msg.guild.id) as XpGuild | undefined
                let scale = row?.scale ?? 1

                const xpAdded = Math.floor((Math.floor(Math.random() * (25 - 15 + 1)) + 15) * scale) // the xp added to the user is generated between 15 and 25 and multiplied by the server scale

                let newXp = currentXp + xpAdded
                const newTotalXp = xpRow.total_xp + xpAdded
                let newLvl = currentLvl

                const nextLevelXp = 5 * (currentLvl * currentLvl) + 50 * currentLvl + 100

                if (newXp >= nextLevelXp) {
                    newLvl += 1
                    newXp = newXp - nextLevelXp

                    if (levelUpMsg === undefined || levelUpMsg === null) levelUpMsg = t("messageCreate:default_lvl_up_msg")
                    levelUpMsg = levelUpMsg
                        .replace("{user}", `<@${msg.author.id}>`)
                        .replace("{username}", msg.author.username)
                        .replace("{tag}", msg.author.tag)
                        .replace("{level}", newLvl.toString())
                        .replace("{server}", msg.guild.name)


                    let xpGuildRequest = bot.db.prepare("SELECT level_up_channel_id FROM xp_guilds WHERE guild_id = ?")
                    const row = xpGuildRequest.get(msg.guild.id) as XpGuild | undefined
                    const channelId = row?.level_up_channel_id ?? msg.channel.id
                    let channel

                    try {
                        channel = await msg.guild.channels.fetch(channelId)
                        if (channel === null || !channel.isText()) throw new Error()
                    }
                    catch {
                        resetLevelUpChannel(bot.db, msg.guild.id)
                        channel = msg.channel
                    }

                    await channel.send(levelUpMsg)

                    if (newLvl === 100) channel.send(t("messageCreate:lvl_100_congrats"))

                    await removeDeletedRolesRewards(bot.db, msg.guild)

                    const roleRequest = bot.db.prepare("SELECT * FROM xp_roles WHERE guild_id = ? ORDER BY level ASC")
                    const rolesRows = roleRequest.all(msg.guild.id) as XpRole[]

                    for (const row of rolesRows) {
                        if (row.level === newLvl) {
                            const role = [...msg.guild.roles.cache.values()].find(currentRole => currentRole.id === row.role_id)

                            if (role !== undefined) {
                                if ([...msg.member.roles.cache.values()].includes(role)) {
                                    channel.send(`${t("messageCreate:you_already_have_the_role")} ${role.name}, ${t("messageCreate:so_i_did_not_gave_it_to_you")}`).catch(() => {
                                        msg.channel.send(`${t("messageCreate:you_already_have_the_role")} ${role.name}, ${t("messageCreate:so_i_did_not_gave_it_to_you")}`)
                                    })
                                }
                                else {
                                    try {
                                        await msg.member.roles.add(role)
    
                                        channel.send(`${t("messageCreate:i_gave_you_the_role")} ${role.name}.`).catch(() => {
                                            msg.channel.send(`${t("messageCreate:i_gave_you_the_role")} ${role.name}.`)
                                        })
                                    }
                                    catch {
                                        channel.send(`${t("messageCreate:i_should_have_given_you")} ${role.name}, ${t("messageCreate:could_not_add_you_role")}`).catch(() => {
                                            msg.channel.send(`${t("messageCreate:i_should_have_given_you")} ${role.name}, ${t("messageCreate:could_not_add_you_role")}`)
                                        })
                                    }
                                }
                            }
                            else {
                                // TODO : remove the role reward because the role no longer exists
                            }
                        }
                    }
                }

                const xpUpdateRequest = bot.db.prepare("INSERT INTO xp_profiles(guild_id, user_id, xp, total_xp, level) VALUES(?,?,?,?,?) ON CONFLICT(guild_id,user_id) DO UPDATE SET xp=excluded.xp, total_xp=excluded.total_xp, level=excluded.level")
                xpUpdateRequest.run(msg.guild.id, msg.author.id, newXp, newTotalXp, newLvl)
            }
        }
    }
}

function resetLevelUpChannel(db: Database, guild_id: string) {
    db.prepare("INSERT INTO xp_guilds(guild_id, is_enabled, level_up_channel_id) VALUES(?,?,?) ON CONFLICT(guild_id) DO UPDATE SET level_up_channel_id=excluded.level_up_channel_id").run(guild_id, 1, null)
}