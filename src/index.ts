import { Client, Events, GatewayIntentBits } from "discord.js"
import fs from "fs"
import http from "http"
import url from "url"
import i18next from "i18next"
import Backend from "i18next-fs-backend"
import { Kirino } from "./lib/misc/types"
import { XpProfile } from "./lib/misc/database"

// eslint-disable-next-line @typescript-eslint/no-var-requires
require("dotenv").config()

type ApiQuery = {
    id?: string,
    limit?: number,
    page?: number
}

type ApiData = {
    guild_metadata: {
        id: string,
        name: string,
        icon: string | null,
        players: number
    },
    players: {
        id: string,
        tag: string,
        avatar: string,
        xp: number,
        total_xp: number,
        level: number,
        color: string | undefined,
        rank: number
    }[]
}

const bot = new Kirino({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.DirectMessages, GatewayIntentBits.DirectMessageReactions] })

async function main() {
    i18next.use(Backend).init({
        lng: "en",
        fallbackLng: "en",
        supportedLngs: ["en", "fr"],
        ns: ["common", "interactionCreate", "messageCreate"],
        defaultNS: "common",
        preload: fs.readdirSync(`${__dirname}/../languages/`),
        backend: {
            loadPath: __dirname + "/../languages/{{lng}}/{{ns}}.yml",
            addPath: __dirname + "/../languages/{{lng}}/{{ns}}.missing.yml"
        }
    })

    startXpApi(bot.apiCooldowns)

    const eventsFiles = fs.readdirSync(`${__dirname}/events`).filter(file => file.endsWith(".js"))
    for (const file of eventsFiles) {
        // eslint-disable-next-line node/global-require
        const { eventHandler } = await import(`${__dirname}/events/${file}`)
        eventHandler(bot)
    }

    const slashCategories = fs.readdirSync(`${__dirname}/commands`)

    for (const category of slashCategories) {
        const slashCommandFiles = fs.readdirSync(`${__dirname}/commands/${category}/`).filter(file => file.endsWith(".js"))
        for (const commandFile of slashCommandFiles) {
            // eslint-disable-next-line node/global-require
            const { command } = await import(`${__dirname}/commands/${category}/${commandFile}`)

            command.category = category
            command.name = command.data.toJSON().name
            bot.commands.set(command.name, command)
        }
    }

    process.on("unhandledRejection", error => {
        console.error("Unhandled promise rejection:", error)
    })

    if (!process.env.KIRINO_TOKEN) throw new Error("No token provided, please check your env.")
    bot.login(process.env.KIRINO_TOKEN)
}

main()

// ------------------------------------------------------------- utility functions

function controlRequest(req: http.IncomingMessage, res: http.ServerResponse, cooldowns: Map<string, number>, cooldown: number) {
    res.setHeader("Content-Type", "application/json")
    if (req.headers.authorization !== process.env.API_TOKEN) {
        res.writeHead(403) // HTTP status code 403 = Forbidden
        res.write(JSON.stringify({ "errors": ["Invalid authentification token."] }))
        res.end()
        return false
    }

    const now = Date.now()
    const ip = req.socket.remoteAddress

    if (!ip) return false

    const timestamp = cooldowns.get(ip)
    if (timestamp !== undefined) {
        const expiration = timestamp + cooldown

        if (now < expiration) {
            res.writeHead(429) // HTTP status code 429 = Too Many Requests
            res.write(JSON.stringify({ "errors": ["Too many requests. Please stop sending requests that fast."] }))
            res.end()
            return false
        }
    }

    cooldowns.set(ip, now)
    setTimeout(() => cooldowns.delete(ip), cooldown)
    return true
}

function startXpApi(cooldowns: Map<string, number>) {
    http.createServer(async (req, res) => {
        if (!req.url) return res.end()

        console.log("Receiving a request on the XP API")
        if (controlRequest(req, res, cooldowns, 500)) {

            let { id, limit, page }: ApiQuery = url.parse(req.url, true).query // url.parse is deprecated but there is no easy workaround on the internet and the URL class is terrible to use imo

            if (limit === undefined) limit = 20 // default values
            if (page === undefined) page = 1

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
            else if (id !== undefined) {
                let guild
                try {
                    guild = await bot.guilds.fetch(id)
                    if (guild.id !== id) id = guild.id // fetch can match a server even if the provided ID is not exactly the same as the server's one (very weird??)
                }
                catch {
                    res.writeHead(404) // HTTP status code 404 = Not Found
                    res.write(JSON.stringify({ "errors": ["I didn't find the specified server. Please ensure that the ID you provided is a valid server ID and that Kirino has access to it."] }))
                    return res.end()
                }

                const serverRequest = bot.db.prepare("SELECT user_id, xp, total_xp, level, color FROM xp_profiles WHERE guild_id = ? ORDER BY level DESC, xp DESC")
                const serverRows = serverRequest.all(id) as XpProfile[]

                if (serverRows.length > 0) {
                    const page_start = (page - 1) * limit
                    const page_end = page * limit - 1

                    if (page_start >= serverRows.length) {
                        res.writeHead(400) // HTTP status code 400 = Bad Request
                        res.write(JSON.stringify({ "errors": ["The specified page is out of bounds."] }))
                        return res.end()
                    }

                    const data: ApiData = {
                        guild_metadata: {
                            id: guild.id,
                            name: guild.name,
                            icon: guild.iconURL({ extension: "png", size: 128 }),
                            players: serverRows.length
                        },
                        players: []
                    }

                    const askedRows = serverRows.slice(page_start, page_end + 1)

                    for (const [i, row] of askedRows.entries()) {
                        const user = await bot.users.fetch(row.user_id)

                        data.players.push({
                            id: user.id,
                            tag: user.displayName,
                            avatar: user.displayAvatarURL({ size: 128 }),
                            xp: row.xp,
                            total_xp: row.total_xp,
                            level: row.level,
                            color: row.color,
                            rank: page_start + i + 1
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