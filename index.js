const Discord = require("discord.js")
const fs = require("fs")
const bsqlite3 = require("better-sqlite3")
const i18n = require("i18n")
const yaml = require("js-yaml")

require("dotenv").config()

const bot = new Discord.Client({ ws: { intents: [Discord.Intents.NON_PRIVILEGED, "GUILD_MEMBERS"] }})

bot.commands = new Discord.Collection()
bot.db = new bsqlite3("database.db", { fileMustExist: true })
bot.commandsCooldowns = new Discord.Collection()
bot.xpCooldowns = new Discord.Collection()
bot.apiCooldowns = new Map()

i18n.configure({
    locales: ['en', 'fr'],
    staticCatalog: {
        en: yaml.safeLoad(fs.readFileSync("./languages/en.yml", "utf-8")),
        fr: yaml.safeLoad(fs.readFileSync("./languages/fr.yml", "utf-8")),
    },
    register: global,
})

startXpApi(bot, { cooldowns: bot.apiCooldowns })

bot.db.prepare("UPDATE presences SET locked = ?").run(0) // unlock calls if the bot restarted while there were some calls in progress that couldn't release the lock

const eventsFiles = fs.readdirSync("./events").filter(file => file.endsWith(".js"))
for (const file of eventsFiles) {
    const eventSetter = require(`./events/${file}`)
    eventSetter(bot)
}

const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"))
for (const file of commandFiles) {
    const command = require(`./commands/${file}`)
	bot.commands.set(command.name, command)
}

process.on('unhandledRejection', error => {
	console.error('Unhandled promise rejection:', error)
})

bot.login(process.env.KIRINO_TOKEN)

// ------------------------------------------------------------- utility functions

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