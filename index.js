const fs = require("fs")
const http = require("http")
const url = require("url")

const { Client, Intents, Collection } = require("discord.js")
const bsqlite3 = require("better-sqlite3")
const i18n = require("i18n")
const yaml = require("js-yaml")

require("dotenv").config()

const bot = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_BANS, Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS, Intents.FLAGS.GUILD_INTEGRATIONS, Intents.FLAGS.GUILD_WEBHOOKS, Intents.FLAGS.GUILD_INVITES, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.GUILD_MESSAGE_TYPING, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.DIRECT_MESSAGE_REACTIONS, Intents.FLAGS.DIRECT_MESSAGE_TYPING] })

bot.commands = new Collection()
bot.db = new bsqlite3("database.db", { fileMustExist: true })
bot.commandsCooldowns = new Collection()
bot.xpCooldowns = new Collection()
bot.apiCooldowns = new Map()
bot.voicesQueues = new Collection()
bot.calls = new Collection()

i18n.configure({
    locales: ["en", "fr"],
    staticCatalog: {
        en: yaml.safeLoad(fs.readFileSync("./languages/en.yml", "utf-8")),
        fr: yaml.safeLoad(fs.readFileSync("./languages/fr.yml", "utf-8"))
    },
    register: global
})

startXpApi(bot, { cooldowns: bot.apiCooldowns })
startCommandsApi(bot, { cooldowns: bot.apiCooldowns })

const eventsFiles = fs.readdirSync("./events").filter(file => file.endsWith(".js"))
for (const file of eventsFiles) {
    const eventSetter = require(`./events/${file}`)
    eventSetter(bot)
}

const categories = fs.readdirSync("./commands")
for (const category of categories) {
    const commandFiles = fs.readdirSync(`./commands/${category}/`).filter(file => file.endsWith(".js"))
    for (const commandFile of commandFiles) {
        const command = require(`./commands/${category}/${commandFile}`)
        command.category = category
        bot.commands.set(command.name, command)
    }
}

process.on("unhandledRejection", error => {
    console.error("Unhandled promise rejection:", error)
})

bot.login(process.env.KIRINO_TOKEN)

// ------------------------------------------------------------- utility functions

function controlRequest(req, res, obj, cooldown) {
    res.setHeader("Content-Type", "application/json")
    if (req.headers.authorization !== process.env.API_TOKEN) {
        res.writeHead(403) // HTTP status code 403 = Forbidden
        res.write(JSON.stringify({ "errors": ["Invalid authentification token."] }))
        res.end()
        return false
    }

    const now = Date.now()
    const ip = req.socket.remoteAddress

    if (obj.cooldowns.has(ip)) {
        const expiration = obj.cooldowns.get(ip) + cooldown

        if (now < expiration) {
            res.writeHead(429) // HTTP status code 429 = Too Many Requests
            res.write(JSON.stringify({ "errors": ["Too many requests. Please stop sending requests that fast."] }))
            res.end()
            return false
        }
    }

    obj.cooldowns.set(ip, now)
    setTimeout(() => obj.cooldowns.delete(ip), cooldown)
    return true
}

function startXpApi(obj) {
    http.createServer(async (req, res) => {
        console.log("Receiving a request on the XP API")
        if (controlRequest(req, res, obj, 500)) {
            let { id, limit, page } = url.parse(req.url, true).query // url.parse is deprecated but there are no alternative working on the internet...

            if (!limit) limit = 20 // default values
            if (!page) page = 1

            console.log(`Request accepted. ID = ${id}, limit = ${limit}, page = ${page}`)

            if (isNaN(limit) || limit <= 0 || limit > 100 || isNaN(page) || page <= 0) {
                res.writeHead(400) // HTTP status code 400 = Bad Request

                const errors = []
                if (isNaN(limit) || limit <= 0 || limit > 100) {
                    errors.push("Invalid limit, the limit must be between 1 and 100.")
                }
                if (isNaN(page) || page <= 0) {
                    errors.push("Invalid page, the page must be greater or equal to 1.")
                }

                res.write(JSON.stringify({ "errors": errors }))
                return res.end()
            }
            else if (id && id !== "undefined") {
                let guild
                try {
                    guild = await bot.guilds.fetch(id)
                    if (guild.id !== id) id = guild.id // fetch can match a server even if the provided ID is not exactly the same as the server's one
                }
                catch {
                    res.writeHead(404) // HTTP status code 404 = Not Found
                    res.write(JSON.stringify({ "errors": ["I didn't find the specified server. Please ensure that the ID you provided is a valid server ID and that Kirino has access to it."] }))
                    return res.end()
                }

                const serverRequest = bot.db.prepare("SELECT user_id, xp, total_xp, level, color FROM xp_profiles WHERE guild_id = ? ORDER BY level DESC, xp DESC")
                const serverRows = serverRequest.all(id)

                if (serverRows.length > 0) {
                    const page_start = (page - 1) * limit
                    const page_end = page * limit - 1

                    if (page_start >= serverRows.length) {
                        res.writeHead(400) // HTTP status code 400 = Bad Request
                        res.write(JSON.stringify({ "errors": ["The specified page is out of bounds."] }))
                        return res.end()
                    }

                    const data = {
                        "guild_metadata": {
                            "id": guild.id,
                            "name": guild.name,
                            "icon": guild.iconURL({ format: "png", dynamic: true, size: 128 }),
                            "players": serverRows.length
                        },
                        "players": []
                    }

                    const askedRows = serverRows.slice(page_start, page_end + 1)

                    for (const [i, row] of askedRows.entries()) {
                        const user = await bot.users.fetch(row.user_id)

                        data.players.push({
                            "id": user.id,
                            "tag": user.tag,
                            "avatar": user.displayAvatarURL({ dynamic: true, size: 128 }),
                            "xp": row.xp,
                            "total_xp": row.total_xp,
                            "level": row.level,
                            "color": row.color,
                            "rank": page_start + i + 1
                        })
                    }

                    res.writeHead(200) // HTTP status code 200 = OK
                    res.write(JSON.stringify(data))
                    console.log("Request response sent with success")
                }
                else {
                    res.writeHead(400) // HTTP status code 400 = Bad Request
                    res.write(JSON.stringify({ "errors": ["Nobody has any XP on this server."] }))
                }
            }
            else {
                res.writeHead(400) // HTTP status code 400 = Bad Request
                res.write(JSON.stringify({ "errors": ["You must specify the ID of the server you want."] }))
            }
            res.end()
        }
    }).listen(62150)
}

function startCommandsApi(obj) {
    http.createServer(async (req, res) => {
        if (controlRequest(req, res, obj, 0)) {
            let { category } = url.parse(req.url, true).query
            const { lang } = url.parse(req.url, true).query

            if (!category) category = "all"

            category = category.toLowerCase()

            const localeBak = getLocale()
            setLocale(lang !== undefined && lang.toLowerCase() === "fr" ? "fr" : "en")

            if (category !== "all" && !categories.includes(category)) {
                res.writeHead(404) // HTTP status code 404 = Not Found
                res.write(JSON.stringify({ "errors": ["The specified category does not exist."] }))
                return res.end()
            }

            const categoriesToGet = category === "all" ? categories : [category]

            let commands = []

            for (const cat of categoriesToGet) {
                const currentCommands = bot.commands.filter(command => command.category === cat).map(command => {
                    command.description = __(`description_${command.name}`)
                    if (`usage_${command.name}` !== __(`usage_${command.name}`)) command.usage = __(`usage_${command.name}`).split("\n").map(usage => usage.startsWith("nocommand ") ? usage.slice(10) : `${command.name} ${usage}`).join("\n")
                    return command
                })

                if (currentCommands) {
                    commands = commands.concat(currentCommands)
                }
            }

            setLocale(localeBak)

            res.writeHead(200) // HTTP status code 200 = OK
            res.write(JSON.stringify({ "category": category, "commands": commands }))
            res.end()
        }
    }).listen(62151)
}