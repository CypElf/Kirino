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

module.exports = startXpApi