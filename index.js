const Discord = require("discord.js")
const fs = require("fs")
const bsqlite3 = require("better-sqlite3")
const i18n = require("i18n")
const yaml = require("js-yaml")

require("dotenv").config()

const bot = new Discord.Client({ ws: { intents: [Discord.Intents.NON_PRIVILEGED, "GUILD_MEMBERS"] }})

bot.commands = new Discord.Collection()
bot.db = new bsqlite3("database.db", { fileMustExist: true })

const commandsCooldowns = new Discord.Collection()
const xpCooldowns = new Discord.Collection()
const apiCooldowns = new Map()

i18n.configure({
    locales: ['en', 'fr'],
    staticCatalog: {
        en: yaml.safeLoad(fs.readFileSync("./languages/en.yml", "utf-8")),
        fr: yaml.safeLoad(fs.readFileSync("./languages/fr.yml", "utf-8")),
    },
    register: global,
})

const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"))

for (const file of commandFiles) {
    const command = require(`./commands/${file}`)
	bot.commands.set(command.name, command)
}

startXpApi(bot, { cooldowns: apiCooldowns })

bot.db.prepare("UPDATE presences SET locked = ?").run(0) // unlock calls if the bot stopped while there were some in progress that couldn't release the lock after their end

bot.once("ready", async () => {
    updateActivity()
    let startDate = new Date()
    const startMonth = String(startDate.getMonth() + 1).padStart(2, "0")
    const startDay = String(startDate.getDate()).padStart(2, "0")
    const startYear = startDate.getFullYear()
    const startHour = String(startDate.getHours()).padStart(2, "0")
    const startMinutes = String(startDate.getMinutes()).padStart(2, "0")
    const startSeconds = String(startDate.getSeconds()).padStart(2, "0")
    startDate = `${startHour}:${startMinutes}:${startSeconds} ${startDay}/${startMonth}/${startYear}`
    console.log(`Connection to Discord established (${startDate})`)
})

// -------------------------------------------------------------

bot.on("message", async msg => {
    const prefixRequest = bot.db.prepare("SELECT * FROM prefixs WHERE id = ?")
    let id
    if (msg.guild) id = msg.guild.id
    else id = msg.author.id
    let prefix = prefixRequest.get(id)
    if (!prefix) prefix = ";"
    else prefix = prefix.prefix
    bot.prefix = prefix

    if (msg.author.bot) return

    const messageArray = msg.content.split(" ")
    const commandName = messageArray[0].toLowerCase().slice(bot.prefix.length)
    const args = messageArray.slice(1)

    const command = bot.commands.get(commandName) || bot.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName))

    // maintenance
    // if (!msg.content.startsWith(bot.prefix)) return
    // if (!command) return
    // return msg.channel.send(__("maintenance"))

    if (msg.guild) {
        // minimal permissions
        if (!msg.guild.me.hasPermission("SEND_MESSAGES")) return
        if (msg.content.startsWith(bot.prefix) && command) {
            if (!msg.guild.me.hasPermission("MANAGE_MESSAGES")) return msg.channel.send(__("need_handle_messages_perm"))
            if (!msg.guild.me.hasPermission("EMBED_LINKS")) return msg.channel.send(__("need_embed_links"))
            if (!msg.guild.me.hasPermission("READ_MESSAGE_HISTORY")) return msg.channel.send(__("need_read_message_history"))
        }
    }

    const setLanguage = require("./lib/language/set_language")
    setLanguage(bot.db, msg)

    checkAfk(bot, msg)
    checkBanwords(bot, msg)

    await handleXp(bot, msg, { cooldowns: xpCooldowns })

    // ------------------------------------------------------------- command validity check

    if (!msg.content.startsWith(bot.prefix)) return
    if (!command) return

    if (command.guildOnly && !msg.guild) {
        return msg.reply(`${__("command_not_available_in_dm")} ${__("kirino_pout")}`)
    }

    // ------------------------------------------------------------- command cooldown check

    if (!commandsCooldowns.has(command.name)) {
        commandsCooldowns.set(command.name, new Discord.Collection())
    }
    
    const now = Date.now()
    const timestamps = commandsCooldowns.get(command.name)
    const cooldown = (command.cooldown || 2) * 1000 // default cooldown is 2 seconds
    
    if (timestamps.has(msg.author.id)) {
        const expiration = timestamps.get(msg.author.id) + cooldown
    
        if (now < expiration) {
            const timeLeft = (expiration - now) / 1000
            return msg.channel.send(`${__("please_wait")} ${timeLeft.toFixed(1)} ${__("more_sec_before_reusing_command")} \`${command.name}\`.`)
        }
    }

    timestamps.set(msg.author.id, now)
    setTimeout(() => timestamps.delete(msg.author.id), cooldown)

    if (command.args && !args.length) {
        if (command.category === "ignore") return
        return bot.commands.get("help").execute(bot, msg, [].concat(commandName))
    }

    try {
        command.execute(bot, msg, args)
    }
    catch (err) {
        console.error(err)
    }
})

bot.on("guildCreate", guild  => {
    console.log(`Server joined: ${guild.name}`)
    updateActivity()
})

bot.on("guildDelete", guild => {
    console.log(`Server left: ${guild.name}`)

    for (const table of ["banwords", "languages", "prefixs", "rules", "presences", "joins_leaves", "xp_blacklisted_channels", "xp_blacklisted_roles", "xp_guilds", "xp_roles"]) {
        bot.db.prepare(`DELETE FROM ${table} WHERE guild_id = ?`).run(guild.id)
    }

    updateActivity()
})

bot.on("messageUpdate", async (oldMsg, newMsg) => {
    checkBanwords(bot, newMsg)
})

bot.on("guildMemberAdd", async member => {
    const handleMemberAdd = require("./lib/joins_leaves/handle_member_add")
    handleMemberAdd(bot.db, member)
})

bot.on("guildMemberRemove", async member => {
    const handleMemberRemove = require("./lib/joins_leaves/handle_member_remove")
    handleMemberRemove(bot.db, member)
})

function updateActivity() {
    bot.user.setActivity(`${bot.guilds.cache.size} servers | ;help | kirino.xyz`, { type: "LISTENING" /*PLAYING, STREAMING, LISTENING or WATCHING*/ })
}

process.on('unhandledRejection', error => {
	console.error('Unhandled promise rejection:', error)
})

bot.login(process.env.KIRINO_TOKEN)

// ------------------------------------------------------------- functions

function checkBanwords(bot, msg) {
    if (msg.guild) {
        if (!msg.content.startsWith(bot.prefix + "banword remove") && !msg.content.startsWith(bot.prefix + "bw remove") && !msg.content.startsWith(bot.prefix + "banword add") && !msg.content.startsWith(bot.prefix + "bw add")) {
    
            const banwordsRequest = bot.db.prepare("SELECT * FROM banwords WHERE guild_id = ?")
            let banwords = banwordsRequest.all(msg.guild.id)
    
            if (banwords) {
                banwords = banwords.map(row => row.word.toLowerCase())
                let emojiNames = msg.content.match(/<:(.*?):[0-9]*>/gm)
                if (emojiNames) emojiNames = emojiNames.map(emoji => emoji.split(":")[1].split(":")[0])
                const messageArray = msg.content.split(" ")
                const loweredMessageArray = messageArray.map(word => word.toLowerCase())
                for (let word of banwords) {
                    if (loweredMessageArray.includes(word.toLowerCase())) return msg.delete().catch(() => {})
                    if (emojiNames) {
                        if (word.startsWith(":") && word.endsWith(":")) {
                            word = word.substring(1, word.length - 1)
                            if (emojiNames.includes(word)) return msg.delete().catch(() => {})
                        }
                    }
                }
            }
        }
    }
}

function checkAfk(bot, msg) {
    const mentions = msg.mentions.users

    const afkRequest = bot.db.prepare("SELECT * FROM afk WHERE user_id = ?")

    mentions.forEach(mention => {
        const mentionnedAfkRow = afkRequest.get(mention.id)

        if (mentionnedAfkRow !== undefined) {
            if (mentionnedAfkRow.id != msg.author.id) {
                if (mentionnedAfkRow.reason) {
                    msg.channel.send(`**${mention.username}**` + __("afk_with_reason") + mentionnedAfkRow.reason)
                }
                else {
                    msg.channel.send(`**${mention.username}**` + __("afk_without_reason"))
                }
            }
        }
    })

    const selfAfkRow = afkRequest.get(msg.author.id)

    if (selfAfkRow !== undefined) {
        const deletionRequest = bot.db.prepare("DELETE FROM afk WHERE user_id = ?")
        deletionRequest.run(msg.author.id)
        msg.reply(__("deleted_from_afk")).then(msg => msg.delete({ timeout: 5000 })).catch(() => {})
    }
}

async function handleXp(bot, msg, obj) {
    if (msg.guild) {
        const Discord = require("discord.js")

        const xpMetadataRequest = bot.db.prepare("SELECT is_enabled, level_up_message FROM xp_guilds WHERE guild_id = ?")
        const xpMetadata = xpMetadataRequest.get(msg.guild.id)
        
        let isEnabled
        let levelUpMsg = null
        if (xpMetadata) {
            isEnabled = xpMetadata.is_enabled
            levelUpMsg = xpMetadata.level_up_message
        }

        const blacklistedChannelsRequest = bot.db.prepare("SELECT channel_id FROM xp_blacklisted_channels WHERE guild_id = ?")
        let blacklistedChannels = blacklistedChannelsRequest.all(msg.guild.id)
        let isBlacklistedChannel = blacklistedChannels.map(row => row.channel_id).find(channel_id => channel_id === msg.channel.id)
        if (isBlacklistedChannel) isBlacklistedChannel = true

        const blacklistedRolesRequest = bot.db.prepare("SELECT role_id FROM xp_blacklisted_roles WHERE guild_id = ?")
        let blacklistedRoles = blacklistedRolesRequest.all(msg.guild.id)
        let memberRoles = msg.member.roles.cache.array().map(role => role.id)
        let hasBlacklistedRole = false
        
        for (const row of blacklistedRoles) {
            if (memberRoles.includes(row.role_id)) hasBlacklistedRole = true
        }

        if (!obj.cooldowns.has(msg.guild.id)) {
            obj.cooldowns.set(msg.guild.id, new Discord.Collection())
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
                let newTotalXp = xpRow.total_xp + xpAdded
                let newLvl = currentLvl
        
                const nextLevelXp = 5 * (currentLvl * currentLvl) + 50 * currentLvl + 100
        
                if (newXp >= nextLevelXp) {
                    newLvl += 1
                    newXp = newXp - nextLevelXp

                    if (levelUpMsg === null) levelUpMsg = __("default_lvl_up_msg")
                    levelUpMsg = levelUpMsg
                            .replace("{user}", `<@${msg.author.id}>`)
                            .replace("{username}", msg.author.username)
                            .replace("{tag}", msg.author.tag)
                            .replace("{level}", newLvl)
                            .replace("{server}", msg.guild.name)


                    const channelRequest = bot.db.prepare("SELECT level_up_channel_id FROM xp_guilds WHERE guild_id = ?")
                    let channel = channelRequest.get(msg.guild.id).level_up_channel_id
                    
                    function resetLevelUpChannel() {
                        const resetChannelRequest = bot.db.prepare("INSERT INTO xp_guilds(guild_id, is_enabled, level_up_channel_id) VALUES(?,?,?) ON CONFLICT(guild_id) DO UPDATE SET level_up_channel_id=excluded.level_up_channel_id")
                        resetChannelRequest.run(msg.guild.id, 1, null)
                    }

                    if (channel !== null) {
                        const getChannel = require("./lib/getters/get_channel")
                        channel = await getChannel(msg, [channel])

                        if (channel === undefined) {
                            resetLevelUpChannel()
                            channel = msg.channel
                        }
                    }

                    else channel = msg.channel

                    channel.send(levelUpMsg).catch(() => {
                        resetLevelUpChannel()
                        msg.channel.send(levelUpMsg)
                    })

                    if (newLvl === 100) channel.send(__("lvl_100_congrats")).catch(() => {
                        resetLevelUpChannel()
                        msg.channel.send(__("lvl_100_congrats"))
                    })
                    
                    const removeDeletedRolesRewards = require("./lib/rolerewards/remove_deleted_roles_rewards")
                    await removeDeletedRolesRewards(bot.db, msg.guild)

                    const roleRequest = bot.db.prepare("SELECT * FROM xp_roles WHERE guild_id = ? ORDER BY level ASC")
                    rolesRows = roleRequest.all(msg.guild.id)

                    for (const row of rolesRows) {
                        if (row.level === newLvl) {
                            const role = msg.guild.roles.cache.array().find(currentRole => currentRole.id === row.role_id)
                            if (msg.member.roles.cache.array().includes(role)) channel.send(`${__("you_already_have_the_role")} ${role.name}, ${__("so_i_did_not_gave_it_to_you")}`).catch(() => {
                                msg.channel.send(`${__("you_already_have_the_role")} ${role.name}, ${__("so_i_did_not_gave_it_to_you")}`)
                            })
                            else {
                                try {
                                    await msg.member.roles.add(role)

                                    channel.send(`${__("i_gave_you_the_role")} ${role.name}.`).catch(() => {
                                        msg.channel.send(`${__("i_gave_you_the_role")} ${role.name}.`)
                                    })
                                }
                                catch {
                                    channel.send(`${__("i_should_have_given_you")} ${role.name}, ${__("could_not_add_you_role")}`).catch(() => {
                                        msg.channel.send(`${__("i_should_have_given_you")} ${role.name}, ${__("could_not_add_you_role")}`)
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

function startXpApi(bot, obj) {
    const http = require("http")
    const url = require("url")

    http.createServer(async (req, res) => {
        const ip = req.connection.remoteAddress
        const auth = req.headers.authorization
    
        if (auth !== process.env.API_TOKEN) {
            res.writeHead(403, {"Content-Type": "application/json",})
            res.write(JSON.stringify({ "error": "Invalid authentification token." }))
            return res.end()
        }
        
        const now = Date.now()
    
        if (obj.cooldowns.has(ip)) {
            const expiration = obj.cooldowns.get(ip) + 1000
        
            if (now < expiration) {
                res.writeHead(403, {"Content-Type": "application/json",})
                res.write(JSON.stringify({ "error": "Too many requests. Please wait before retrying." }))
                return res.end()
            }
        }
    
        obj.cooldowns.set(ip, now)
        setTimeout(() => obj.cooldowns.delete(ip), 1000)
    
        const queries = url.parse(req.url, true).query
        const gid = queries.gid
        let limit = queries.limit
        let page = queries.page
    
        if (!limit) limit = 20 // default values
        if (!page) page = 1
    
        if (isNaN(limit) || limit <= 0 || limit > 1000 || isNaN(page) || page <= 0) {
            res.writeHead(422, {"Content-Type": "application/json"})
            let error = ""
            if (isNaN(limit) || limit <= 0 || limit > 1000) error += "Invalid limit. The limit must be between 1 and 1000."
            if (error.length > 0) error += "\n"
            if (isNaN(page) || page <= 0) error += "Invalid page. The page must be greater or equal to 1."
    
            res.write(JSON.stringify({ "error": error }))
            res.end()
        }
        else if (gid) {
            const guild = bot.guilds.cache.find(guild => guild.id === gid)
    
            if (guild) {
                const serverRequest = bot.db.prepare("SELECT user_id, xp, total_xp, level, color FROM xp_profiles WHERE guild_id = ? ORDER BY level DESC, xp DESC")
                const serverRows = serverRequest.all(gid)
        
                if (serverRows.length > 0) {
                    let data = {
                        "guild_metadata": {
                            "name": guild.name,
                            "icon": guild.iconURL({ format: "png", dynamic: true }),
                            "players": serverRows.length
                        },
                        "players": []
                    }
    
                    let i = 1
                    let j = 1
                    let currentPage = 1
    
                    for (const row of serverRows) {
                    
                        if (i > limit) {
                            i = 1
                            currentPage += 1
                            if (currentPage > page) break
                        }
                        if (currentPage == page) {
                            try {
                                const user = await bot.users.fetch(row.user_id)

                                const avatarUrl = user.displayAvatarURL({ format: "png", dynamic: true })
                                const tag = user.tag
                                data.players.push({
                                    "tag": tag,
                                    "id": user.id,
                                    "avatar": avatarUrl,
                                    "xp": row.xp,
                                    "total_xp": row.total_xp,
                                    "level": row.level,
                                    "color": row.color,
                                    "rank": j
                                })
                            } catch {}
                        }
                        i++
                        j++
                    }
    
                    if (data.players.length === 0) {
                        res.writeHead(404, {"Content-Type": "application/json",})
                        res.write(JSON.stringify({ "error": "Page out of bounds." }))
                        res.end()
                    }
    
                    else {
                        res.writeHead(200, {"Content-Type": "application/json",})
                        res.write(JSON.stringify(data))
                        res.end()
                    }
                }
                else {
                    res.writeHead(404, {"Content-Type": "application/json"})
                    res.write(JSON.stringify({ "error": "No members have any XP on this server." }))
                    res.end()
                }
            }
            else {
                res.writeHead(404, {"Content-Type": "application/json"})
                res.write(JSON.stringify({ "error": "Server not found." }))
                res.end()
            }
        }
        else {
            res.writeHead(404, {"Content-Type": "application/json"})
            res.write(JSON.stringify({ "error": "No server ID provided." }))
            res.end()
        }
    }).listen(62150)
}