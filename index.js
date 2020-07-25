const Discord = require("discord.js")
const config = require("./config.json")
const fs = require("fs")
const http = require("http")
const url = require("url")
const bsqlite3 = require("better-sqlite3")
const i18n = require("i18n")

require("dotenv").config()

const bot = new Discord.Client(Discord.Intents.NON_PRIVILEGED)

bot.commands = new Discord.Collection()
bot.config = config
bot.db = new bsqlite3("database.db", { fileMustExist: true })

const commandsCooldowns = new Discord.Collection()
const xpCooldowns = new Discord.Collection()

i18n.configure({
    locales: ['en', 'fr'],
    directory: __dirname + "/languages",
    autoReload: true,
    register: global,
})

const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"))

for (const file of commandFiles) {
    const command = require(`./commands/${file}`)
	bot.commands.set(command.name, command)
}


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
    // if (msg.content.startsWith(bot.prefix)) return msg.channel.send(__("maintenance"))
    // else return

    if (msg.guild) {
        if (!msg.guild.me.hasPermission("SEND_MESSAGES")) return

        if (msg.content.startsWith(bot.prefix) && command) {

            if (!msg.guild.me.hasPermission("MANAGE_MESSAGES")) return msg.channel.send(__("need_handle_messages_perm"))
            if (!msg.guild.me.hasPermission("EMBED_LINKS")) return msg.channel.send(__("need_embed_links"))
            if (!msg.guild.me.hasPermission("ATTACH_FILES")) return msg.channel.send(__("need_attach_files"))
            if (!msg.guild.me.hasPermission("READ_MESSAGE_HISTORY")) return msg.channel.send(__("need_read_message_history"))
        }
    }

    // ------------------------------------------------------------- language settings

    let callerID
    if (msg.guild) callerID = msg.guild.id
    else callerID = msg.author.id

    const languagesRequest = bot.db.prepare("SELECT * FROM languages WHERE id = ?")
    const languageRow = languagesRequest.get(callerID)
    if (languageRow !== undefined) {
        setLocale(languageRow.language)
    }
    else {
        setLocale("en")
    }


    // ------------------------------------------------------------- AFK check

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
    
    // ------------------------------------------------------------- banwords check on message

    checkWords(msg, bot.db)

    // ------------------------------------------------------------- xp

    if (msg.guild) {
        const xpMetadataRequest = bot.db.prepare("SELECT is_enabled, level_up_message FROM xp_metadata WHERE guild_id = ?")
        const xpMetadata = xpMetadataRequest.get(msg.guild.id)
        
        let isEnabled
        let levelUpMsg = null
        if (xpMetadata) {
            isEnabled = xpMetadata.is_enabled
            levelUpMsg = xpMetadata.level_up_message
        }

        if (!xpCooldowns.has(msg.guild.id)) {
            xpCooldowns.set(msg.guild.id, new Discord.Collection())
        }
        let isReady = true

        const now = Date.now()
        const timestamps = xpCooldowns.get(msg.guild.id)
        const cooldown = 60_000
        
        if (timestamps.has(msg.author.id)) {
            const expiration = timestamps.get(msg.author.id) + cooldown // 1 minute cooldown
        
            if (now < expiration) {
                isReady = false
            }
        }
    
        timestamps.set(msg.author.id, now)
        setTimeout(() => timestamps.delete(msg.author.id), cooldown)

        if (isEnabled && isReady) {
            const xpRequest = bot.db.prepare("SELECT * FROM xp WHERE guild_id = ? AND user_id = ?")
            let xpRow = xpRequest.get(msg.guild.id, msg.author.id)

            if (xpRow === undefined) {
                xpRow = { guild_id: msg.guild.id, user_id: msg.author.id, xp: 0, total_xp: 0, level: 0, color: null }
            }
    
            const currentXp = xpRow.xp
            const currentLvl = xpRow.level

            if (currentLvl < 100) {
                let newXp = currentXp + Math.floor(Math.random() * (25 - 15 + 1)) + 15 // the xp added to the user is generated between 15 and 25
                let newTotalXp = xpRow.total_xp + newXp
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

                    msg.channel.send(levelUpMsg)
                    if (newLvl === 100) msg.channel.send(__("lvl_100_congrats"))
                }
        
                const xpUpdateRequest = bot.db.prepare("INSERT INTO xp VALUES(?,?,?,?,?,?) ON CONFLICT(guild_id,user_id) DO UPDATE SET xp=excluded.xp, total_xp=excluded.total_xp, level=excluded.level")
                xpUpdateRequest.run(msg.guild.id, msg.author.id, newXp, newTotalXp, newLvl, xpRow.color)
            }
        }
    }

    // ------------------------------------------------------------- command check

    if (!msg.content.startsWith(bot.prefix)) return
    if (!command) return

    if (command.guildOnly && !msg.guild) {
        return msg.reply(__("command_not_available_in_dm") + " <:kirinopout:698923065773522944>")
    }

    // ------------------------------------------------------------- commands cooldown check

    if (!commandsCooldowns.has(command.name)) {
        commandsCooldowns.set(command.name, new Discord.Collection())
    }
    
    const now = Date.now()
    const timestamps = commandsCooldowns.get(command.name)
    const cooldown = (command.cooldown || 2) * 1000 // default cooldown is 2 seconds, for commands without a cooldown
    
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

// ------------------------------------------------------------- xp leaderboard

http.createServer(async (req, res) => {
    const queries = url.parse(req.url, true).query
    const gid = queries.gid
    let limit = queries.limit
    let page = queries.page

    if (!limit) limit = 20 // default values
    if (!page) page = 1

    if (limit <= 0 || limit > 1000 || page <= 0) {
        res.writeHead(422, {"Content-Type": "application/json"})
        let error = ""
        if (limit <= 0 || limit > 1000) error += "Invalid limit. Minimum is 1 and maximum is 1000."
        if (error.length > 0) error += "\n"
        if (page <= 0) error += "Invalid page. Minimum is 1."

        res.write(JSON.stringify({ "error": error }))
        res.end()
    }
    else if (gid) {
        const guild = bot.guilds.cache.find(guild => guild.id === gid)

        if (guild) {
            const serverRequest = bot.db.prepare("SELECT user_id, xp, total_xp, level, color FROM xp WHERE guild_id = ? ORDER BY level DESC, xp DESC")
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
                    try {
                        if (i > limit) {
                            i = 1
                            currentPage += 1
                            if (currentPage > page) break
                        }
                        if (currentPage == page) {
                            const member = await guild.members.fetch(row.user_id)
                    
                            if (member) {
                                const avatarUrl = member.user.displayAvatarURL({ format: "png", dynamic: true })
                                const tag = member.user.tag
                                data.players.push({
                                    "tag": tag,
                                    "id": member.id,
                                    "avatar": avatarUrl,
                                    "xp": row.xp,
                                    "total_xp": row.total_xp,
                                    "level": row.level,
                                    "color": row.color,
                                    "rank": j
                                })
                            }
                        }
                        i++
                        j++
                    }
                    catch {}
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
        res.writeHead(404, {"Content-Type": "text/html"})
        res.write("No server ID provided as a GET parameter.")
        res.end()
    }
    
}).listen(62150)

// ------------------------------------------------------------- join / leave

bot.on("guildCreate", guild  => {
    console.log(`Server joined: ${guild.name}`)
    updateActivity()
})
bot.on("guildDelete", guild => {
    console.log(`Server left: ${guild.name}`)
    const id = guild.id
    let deletionRequest = bot.db.prepare("DELETE FROM banwords WHERE guild_id = ?")
    deletionRequest.run(id)
    deletionRequest = bot.db.prepare("DELETE FROM languages WHERE id = ?")
    deletionRequest.run(id)
    deletionRequest = bot.db.prepare("DELETE FROM prefixs WHERE id = ?")
    deletionRequest.run(id)
    deletionRequest = bot.db.prepare("DELETE FROM rules WHERE guild_id = ?")
    deletionRequest.run(id)
    updateActivity()
})

// ------------------------------------------------------------- banwords check on edit

bot.on("messageUpdate", async (oldMsg, newMsg) => {
    checkWords(newMsg, bot.db)
})

// ------------------------------------------------------------- banword check function for message and edit events

const checkWords = (msg, db) => {
    if (msg.guild) {
        if (!msg.content.startsWith(bot.prefix + "banword remove") && !msg.content.startsWith(bot.prefix + "bw remove") && !msg.content.startsWith(bot.prefix + "banword add") && !msg.content.startsWith(bot.prefix + "bw add")) {
    
            const banwordsRequest = db.prepare("SELECT * FROM banwords WHERE guild_id = ?")
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

// ------------------------------------------------------------- update bot activity

const updateActivity = () => {
    guildsCount = bot.guilds.cache.size
    bot.user.setActivity(`${guildsCount} servers | ;help`, { type: "LISTENING" /*PLAYING, STREAMING, LISTENING ou WATCHING*/ })
}

process.on('unhandledRejection', error => {
	console.error('Unhandled promise rejection:', error)
})

bot.login(process.env.KIRINO_TOKEN)