import { StatusCodes } from "http-status-codes"
import http from "http"
import url from "url"
import { Kirino } from "../misc/types"
import { XpProfile } from "../misc/database"

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

function controlRequest(req: http.IncomingMessage, res: http.ServerResponse, apiCooldowns: Map<string, number>, cooldown: number) {
    res.setHeader("Content-Type", "application/json")
    if (req.headers.authorization !== process.env.API_TOKEN) {
        res.writeHead(StatusCodes.FORBIDDEN)
        res.write(JSON.stringify({ "errors": ["Invalid authentification token."] }))
        res.end()
        return false
    }

    const now = Date.now()
    const ip = req.socket.remoteAddress

    if (!ip) return false

    const timestamp = apiCooldowns.get(ip)
    if (timestamp !== undefined) {
        const expiration = timestamp + cooldown

        if (now < expiration) {
            res.writeHead(StatusCodes.TOO_MANY_REQUESTS)
            res.write(JSON.stringify({ "errors": ["Too many requests. Please stop sending requests that fast."] }))
            res.end()
            return false
        }
    }

    apiCooldowns.set(ip, now)
    setTimeout(() => apiCooldowns.delete(ip), cooldown)
    return true
}

export function startXpApi(bot: Kirino) {
    http.createServer(async (req, res) => {
        if (!req.url) return res.end()

        if (controlRequest(req, res, bot.apiCooldowns, 500)) {

            let { id, limit, page }: ApiQuery = url.parse(req.url, true).query // url.parse is deprecated but there is no easy workaround on the internet and the URL class is terrible to use imo

            if (limit === undefined) limit = 20 // default values
            if (page === undefined) page = 1

            if (isNaN(limit) || limit <= 0 || limit > 100 || isNaN(page) || page <= 0) {
                res.writeHead(StatusCodes.BAD_REQUEST)

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
                    res.writeHead(StatusCodes.NOT_FOUND)
                    res.write(JSON.stringify({ "errors": ["I didn't find the specified server. Please ensure that the ID you provided is a valid server ID and that Kirino has access to it."] }))
                    return res.end()
                }

                const serverRequest = bot.db.prepare("SELECT user_id, xp, total_xp, level, color FROM xp_profiles WHERE guild_id = ? ORDER BY level DESC, xp DESC")
                const serverRows = serverRequest.all(id) as XpProfile[]

                if (serverRows.length > 0) {
                    const page_start = (page - 1) * limit
                    const page_end = page * limit - 1

                    if (page_start >= serverRows.length) {
                        res.writeHead(StatusCodes.BAD_REQUEST)
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

                    console.log(`XP API request success for server ${guild.name}`)

                    res.writeHead(StatusCodes.OK)
                    res.write(JSON.stringify(data))
                }
                else {
                    res.writeHead(StatusCodes.BAD_REQUEST)
                    res.write(JSON.stringify({ "errors": ["Nobody has any XP on this server."] }))
                }
            }
            else {
                res.writeHead(StatusCodes.BAD_REQUEST)
                res.write(JSON.stringify({ "errors": ["You must specify the ID of the server you want."] }))
            }
            res.end()
        }
    }).listen(62150, "127.0.0.1")
}