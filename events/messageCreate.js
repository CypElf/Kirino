const { Collection, Permissions } = require("discord.js")
const i18next = require("i18next")
const t = i18next.t.bind(i18next)
const checkBanwords = require("../lib/banwords/check_banwords")
const removeDeletedRolesRewards = require("../lib/rolerewards/remove_deleted_roles_rewards")

module.exports = bot => {
    bot.on("messageCreate", async msg => {
        const prefixRequest = bot.db.prepare("SELECT * FROM prefixs WHERE id = ?")
        const id = msg.guild ? msg.guild.id : msg.author.id

        let prefix = prefixRequest.get(id)
        if (!prefix) prefix = ";"
        else prefix = prefix.prefix
        bot.prefix = prefix

        if (msg.author.bot) return

        const separator = msg.content.split("\n")[0].split(" ").length > 1 ? " " : "\n"

        const commandName = msg.content.split(separator)[0].toLowerCase().slice(bot.prefix.length)
        let args = msg.content.split(separator).slice(1)

        if (separator == "\n" && args.length > 0) args = args.join("\n").split(" ")

        const command = bot.commands.get(commandName) || bot.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName))

        const lang = bot.db.prepare("SELECT * FROM languages WHERE id = ?").get(msg.guild ? msg.guild.id : msg.author.id)?.language ?? "en"
        await i18next.changeLanguage(lang)
        setLocale(lang) // TODO : once the legacy commands support will be dropped, remove this line

        if (msg.guild) {
            // minimal needed permissions
            if (!msg.guild.me.permissions.has(Permissions.FLAGS.SEND_MESSAGES)) return
            if (msg.content.startsWith(bot.prefix) && command) {
                if (!msg.guild.me.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES)) return msg.channel.send(t("messageCreate:need_handle_messages_perm"))
                if (!msg.guild.me.permissions.has(Permissions.FLAGS.EMBED_LINKS)) return msg.channel.send(t("messageCreate:need_embed_links"))
                if (!msg.guild.me.permissions.has(Permissions.FLAGS.READ_MESSAGE_HISTORY)) return msg.channel.send(t("messageCreate:need_read_message_history"))
            }
        }

        checkAfk(bot, msg)
        checkBanwords(bot, msg)

        await handleXp(bot, msg, { cooldowns: bot.xpCooldowns })

        // ------------------------------------------------------------- prefix reminder

        if (msg.mentions.users.has(bot.user.id) && msg.content === `<@!${bot.user.id}>`) return msg.channel.send(`${t("messageCreate:bot_mention")} \`${bot.prefix}\`.`)

        // ------------------------------------------------------------- command validity check

        if (!msg.content.startsWith(bot.prefix)) return
        if (!command) return

        if (command.guildOnly && !msg.guild) {
            return msg.reply(`${t("messageCreate:command_not_available_in_dm")} ${t("common:kirino_pout")}`)
        }

        // ------------------------------------------------------------- beta check

        if (command.beta) {
            const betaRow = bot.db.prepare("SELECT * FROM beta WHERE id = ?").get(id)

            if (betaRow === undefined) {
                return msg.channel.send(`${t("messageCreate:command_in_beta")} \`${bot.prefix}beta enable\` ${t("common:kirino_glad")}`)
            }
        }

        // ------------------------------------------------------------- command cooldown check

        if (!bot.commandsCooldowns.has(command.name)) {
            bot.commandsCooldowns.set(command.name, new Collection())
        }

        const now = Date.now()
        const timestamps = bot.commandsCooldowns.get(command.name)
        const cooldown = (command.cooldown || 2) * 1000 // default cooldown is 2 seconds

        if (timestamps.has(msg.author.id)) {
            const expiration = timestamps.get(msg.author.id) + cooldown

            if (now < expiration) {
                const timeLeft = (expiration - now) / 1000
                return msg.channel.send(`${t("messageCreate:please_wait", { count: Math.ceil(timeLeft), cooldown: timeLeft.toFixed(1) })} \`${command.name}\`.`)
            }
        }

        timestamps.set(msg.author.id, now)
        setTimeout(() => timestamps.delete(msg.author.id), cooldown)

        if (command.args && !args.length) {
            if (command.category === "ignore") return
            return bot.commands.get("help").execute(bot, msg, [].concat(command.name))
        }

        await i18next.loadNamespaces(commandName)
        i18next.setDefaultNamespace(commandName)
        console.log(`Executing ${command.name} for ${msg.author.tag} (from ${msg.guild ? msg.guild.name : "DM"})`)

        try {
            await command.execute(bot, msg, args)
        }
        catch (err) {
            console.error(err.stack)
            msg.channel.send(`${t("messageCreate:command_runtime_error")} ${t("common:kirino_what")}`)
        }
    })
}

// ------------------------------------------------------------- utility functions

function checkAfk(bot, msg) {
    const mentions = msg.mentions.users

    const afkRequest = bot.db.prepare("SELECT * FROM afk WHERE user_id = ?")

    mentions.forEach(mention => {
        const mentionnedAfkRow = afkRequest.get(mention.id)

        if (mentionnedAfkRow !== undefined) {
            if (mentionnedAfkRow.id != msg.author.id) {
                if (mentionnedAfkRow.reason) {
                    msg.channel.send(`**${mention.username}**` + t("messageCreate:afk_with_reason") + mentionnedAfkRow.reason)
                }
                else {
                    msg.channel.send(`**${mention.username}**` + t("messageCreate:afk_without_reason"))
                }
            }
        }
    })

    const selfAfkRow = afkRequest.get(msg.author.id)

    if (selfAfkRow !== undefined) {
        const deletionRequest = bot.db.prepare("DELETE FROM afk WHERE user_id = ?")
        deletionRequest.run(msg.author.id)
        msg.reply(t("messageCreate:deleted_from_afk")).then(afkMsg => setTimeout(() => afkMsg.delete().catch(), 5000)).catch()
    }
}

async function handleXp(bot, msg, obj) {
    if (msg.guild) {

        const xpMetadataRequest = bot.db.prepare("SELECT is_enabled, level_up_message FROM xp_guilds WHERE guild_id = ?")
        const xpMetadata = xpMetadataRequest.get(msg.guild.id)

        let isEnabled
        let levelUpMsg = null
        if (xpMetadata) {
            isEnabled = xpMetadata.is_enabled
            levelUpMsg = xpMetadata.level_up_message
        }

        const blacklistedChannelsRequest = bot.db.prepare("SELECT channel_id FROM xp_blacklisted_channels WHERE guild_id = ?")
        const blacklistedChannels = blacklistedChannelsRequest.all(msg.guild.id)
        let isBlacklistedChannel = blacklistedChannels.map(row => row.channel_id).find(channel_id => channel_id === msg.channel.id)
        if (isBlacklistedChannel) isBlacklistedChannel = true

        const blacklistedRolesRequest = bot.db.prepare("SELECT role_id FROM xp_blacklisted_roles WHERE guild_id = ?")
        const blacklistedRoles = blacklistedRolesRequest.all(msg.guild.id)
        const memberRoles = [...msg.member.roles.cache.values()].map(role => role.id)
        let hasBlacklistedRole = false

        for (const row of blacklistedRoles) {
            if (memberRoles.includes(row.role_id)) hasBlacklistedRole = true
        }

        if (!obj.cooldowns.has(msg.guild.id)) {
            obj.cooldowns.set(msg.guild.id, new Collection())
        }
        let isReady = true

        const now = Date.now()
        const timestamps = obj.cooldowns.get(msg.guild.id)
        const cooldown = 60_000

        if (timestamps.has(msg.author.id)) {
            const expiration = timestamps.get(msg.author.id) + cooldown // 1 minute cooldown

            if (now < expiration) {
                isReady = false
            }
        }

        timestamps.set(msg.author.id, now)
        setTimeout(() => timestamps.delete(msg.author.id), cooldown)

        if (isEnabled && isReady && !isBlacklistedChannel && !hasBlacklistedRole) {
            const xpRequest = bot.db.prepare("SELECT * FROM xp_profiles WHERE guild_id = ? AND user_id = ?")
            let xpRow = xpRequest.get(msg.guild.id, msg.author.id)

            if (xpRow === undefined) {
                xpRow = { guild_id: msg.guild.id, user_id: msg.author.id, xp: 0, total_xp: 0, level: 0, color: null }
            }

            const currentXp = xpRow.xp
            const currentLvl = xpRow.level

            if (currentLvl < 100) {
                const scaleRequest = bot.db.prepare("SELECT scale FROM xp_guilds WHERE guild_id = ?")
                let scale = scaleRequest.get(msg.guild.id).scale
                if (scale === null) scale = 1

                const xpAdded = Math.floor((Math.floor(Math.random() * (25 - 15 + 1)) + 15) * scale) // the xp added to the user is generated between 15 and 25 and multiplied by the server scale

                let newXp = currentXp + xpAdded
                const newTotalXp = xpRow.total_xp + xpAdded
                let newLvl = currentLvl

                const nextLevelXp = 5 * (currentLvl * currentLvl) + 50 * currentLvl + 100

                if (newXp >= nextLevelXp) {
                    newLvl += 1
                    newXp = newXp - nextLevelXp

                    if (levelUpMsg === null) levelUpMsg = t("messageCreate:default_lvl_up_msg")
                    levelUpMsg = levelUpMsg
                        .replace("{user}", `<@${msg.author.id}>`)
                        .replace("{username}", msg.author.username)
                        .replace("{tag}", msg.author.tag)
                        .replace("{level}", newLvl)
                        .replace("{server}", msg.guild.name)


                    let channel = bot.db.prepare("SELECT level_up_channel_id FROM xp_guilds WHERE guild_id = ?").get(msg.guild.id).level_up_channel_id ?? msg.channel.id

                    try {
                        channel = await msg.guild.channels.fetch(channel)
                    }
                    catch {
                        resetLevelUpChannel(bot.db, msg.guild.id)
                        channel = msg.channel
                    }

                    await channel.send(levelUpMsg)

                    if (newLvl === 100) channel.send(t("messageCreate:lvl_100_congrats"))

                    await removeDeletedRolesRewards(bot.db, msg.guild)

                    const roleRequest = bot.db.prepare("SELECT * FROM xp_roles WHERE guild_id = ? ORDER BY level ASC")
                    rolesRows = roleRequest.all(msg.guild.id)

                    for (const row of rolesRows) {
                        if (row.level === newLvl) {
                            const role = [...msg.guild.roles.cache.values()].find(currentRole => currentRole.id === row.role_id)
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
                    }
                }

                const xpUpdateRequest = bot.db.prepare("INSERT INTO xp_profiles(guild_id, user_id, xp, total_xp, level) VALUES(?,?,?,?,?) ON CONFLICT(guild_id,user_id) DO UPDATE SET xp=excluded.xp, total_xp=excluded.total_xp, level=excluded.level")
                xpUpdateRequest.run(msg.guild.id, msg.author.id, newXp, newTotalXp, newLvl)
            }
        }
    }
}

function resetLevelUpChannel(db, guild_id) {
    db.prepare("INSERT INTO xp_guilds(guild_id, is_enabled, level_up_channel_id) VALUES(?,?,?) ON CONFLICT(guild_id) DO UPDATE SET level_up_channel_id=excluded.level_up_channel_id").run(guild_id, 1, null)
}