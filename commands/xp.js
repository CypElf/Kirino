const Canvas = require("canvas")
const { __ } = require("i18n")

module.exports = {
	name: "xp",
    description: "description_xp",
    guildOnly: true,
    args: false,
    cooldown: 3,
    category: "xp",
    usage: "usage_xp",
    permissions: ["{administrator}"],

    async execute (bot, msg, args) {
        const getUser = require("../lib/get_user")

        const xpActivationRequest = bot.db.prepare("SELECT is_enabled FROM xp_guilds WHERE guild_id = ?")
        let isEnabled = xpActivationRequest.get(msg.guild.id)
        if (isEnabled) isEnabled = isEnabled.is_enabled

        const request = args[0]

        if (request === "enable" || request === "disable") {
            if (!msg.member.hasPermission("ADMINISTRATOR")) return msg.channel.send(`${__("not_allowed_to_enable_or_disable")} ${__("kirino_pff")}`)
            const enableRequest = bot.db.prepare("INSERT INTO xp_guilds(guild_id,is_enabled) VALUES(?,?) ON CONFLICT(guild_id) DO UPDATE SET is_enabled=excluded.is_enabled")

            if (request === "enable") {
                if (isEnabled) return msg.channel.send(`${__("xp_already_enabled")} ${__("kirino_pout")}`)
                enableRequest.run(msg.guild.id, 1)
                msg.channel.send(`${__("xp_enabled")} ${__("kirino_glad")}`)
            }

            else {
                if (!isEnabled) return msg.channel.send(`${__("xp_already_disabled")} ${__("kirino_pout")}`)
                enableRequest.run(msg.guild.id, 0)
                msg.channel.send(`${__("xp_disabled")} ${__("kirino_glad")}`)
            }
        }

        else {
            if (isEnabled) {
                const filter = (reaction, user) => {
                    return reaction.emoji.name === '✅' && user.id === msg.author.id || reaction.emoji.name === '❌' && user.id === msg.author.id
                }

                if (request === "reset") {
                    if (!msg.member.hasPermission("ADMINISTRATOR")) return msg.channel.send(`${__("not_allowed_to_reset_xp")} ${__("kirino_pff")}`)
                    if (!msg.guild.me.hasPermission("ADD_REACTIONS")) return msg.channel.send(`${__("cannot_react_to_messages")} ${__("kirino_pout")}`)
        
                    args.shift()
        
                    if (args[0] === "all") {
                        const validationMessage = await msg.channel.send(__("server_xp_reset_validation"))
        
                        validationMessage.react('✅')
                        validationMessage.react('❌')
        
                        const collector = validationMessage.createReactionCollector(filter, { max: 1, time: 30_000 })
                
                        collector.on("collect", (reaction) => {
                            if (reaction.emoji.name === '✅') {
                                const profileDeletionRequest = bot.db.prepare("DELETE FROM xp_profiles WHERE guild_id = ?")
                                profileDeletionRequest.run(msg.guild.id)
                                msg.channel.send(`${__("server_xp_successfully_reset")} ${__("kirino_glad")}`)
                            }
                            else {
                                msg.channel.send(__("server_xp_canceled"))
                            }
                        }) 
                    }
                    else {
                        let member
                        if (args[0] === undefined) member = msg.member
                        else member = getUser(msg, args)
                        if (!member) return msg.channel.send(`${__("please_correctly_write_or_mention_a_member")} ${__("kirino_pout")}`)
                        else if (member.user.bot) return msg.channel.send(`${__("bots_not_allowed")} ${__("kirino_pout")}`)
                        
                        const isInXpTableRequest = bot.db.prepare("SELECT * FROM xp_profiles WHERE guild_id = ? AND user_id = ?")
                        const isInXpTable = isInXpTableRequest.get(msg.guild.id, member.id)
        
                        if (!isInXpTable) return msg.channel.send(__("member_zero_xp"))
        
                        let validationMessage
                        if (args[0] === undefined) validationMessage = await msg.channel.send(__("your_xp_reset_validation"))
                        else validationMessage = await msg.channel.send(`${__("are_you_sure_you_want_to_reset")} ${member.user.username}${__("'s_xp")}`)
        
                        validationMessage.react('✅')
                        validationMessage.react('❌')
        
                        const collector = validationMessage.createReactionCollector(filter, { max: 1, time: 30_000 })
                
                        collector.on("collect", (reaction) => {
                            if (reaction.emoji.name === '✅') {
                                const profileDeletionRequest = bot.db.prepare("INSERT INTO xp_profiles(guild_id, user_id, xp, total_xp, level) VALUES(?,?,?,?,?) ON CONFLICT(guild_id, user_id) DO UPDATE SET xp=excluded.xp, total_xp=excluded.total_xp, level=excluded.level")
                                profileDeletionRequest.run(msg.guild.id, member.id, 0, 0, 0)
                                if (args[0] === undefined) msg.channel.send(`${__("your_xp_successfully_reset")} ${__("kirino_glad")}`)
                                else msg.channel.send(`${__("xp_reset_of")}${member.user.username}${__("successfully_reset")} ${__("kirino_glad")}`)
                            }
                            else {
                                msg.channel.send(`${__("xp_reset_of")}${member.user.username}${__("cancelled")}`)
                            }
                        })
                    }
                }

                else if (request === "message" || request === "msg") {
                    if (!msg.member.hasPermission("ADMINISTRATOR")) return msg.channel.send(`${__("not_allowed_to_change_lvl_up_msg")} ${__("kirino_pff")}`)
                    args.shift()
                    let newMsg = args.join(" ")

                    if (newMsg === "reset") newMsg = null
                    const msgUpdateRequest = bot.db.prepare("INSERT INTO xp_guilds(guild_id, is_enabled, level_up_message) VALUES(?,?,?) ON CONFLICT(guild_id) DO UPDATE SET level_up_message=excluded.level_up_message")
                    msgUpdateRequest.run(msg.guild.id, 1, newMsg)
                    if (newMsg === null) msg.channel.send(`${__("lvl_up_msg_reset")} ${__("kirino_glad")}`)
                    else msg.channel.send(`${__("lvl_up_msg_updated")} ${__("kirino_glad")}`)
                }

                else if (request === "channel") {
                    if (!msg.member.hasPermission("ADMINISTRATOR")) return msg.channel.send(`${__("not_allowed_to_change_channel")} ${__("kirino_pff")}`)

                    if (args.slice(1)[0] === undefined) {
                        const getChannelRequest = bot.db.prepare("SELECT level_up_channel_id FROM xp_guilds WHERE guild_id = ?")
                        let channel = getChannelRequest.get(msg.guild.id).level_up_channel_id

                        if (channel === null) msg.channel.send(`${__("no_level_up_channel")} ${__("kirino_glad")}`)
                        else {
                            const getChannel = require("../lib/get_channel")
                            channel = getChannel(msg, [channel])
                            if (channel === undefined) {
                                const resetChannelRequest = bot.db.prepare("INSERT INTO xp_guilds(guild_id, is_enabled, level_up_channel_id) VALUES(?,?,?) ON CONFLICT(guild_id) DO UPDATE SET level_up_channel_id=excluded.level_up_channel_id")
                                resetChannelRequest.run(msg.guild.id, 1, null)
                                msg.channel.send(`${__("no_level_up_channel")} ${__("kirino_glad")}`)
                            }
                            else {
                                msg.channel.send(`${__("level_up_channel_is")} <#${channel.id}>. ${__("kirino_glad")}`)
                            }
                        }
                    }
                    else {
                        const changeChannelRequest = bot.db.prepare("INSERT INTO xp_guilds(guild_id, is_enabled, level_up_channel_id) VALUES(?,?,?) ON CONFLICT(guild_id) DO UPDATE SET level_up_channel_id=excluded.level_up_channel_id")                    

                        const getChannel = require("../lib/get_channel")
                        let channel = getChannel(msg, args.slice(1))

                        if (args.slice(1)[0] === "reset") channel = null
                        else channel = channel.id

                        if (channel === undefined) return msg.channel.send(`${__("bad_channel")} ${__("kirino_pout")}`)

                        changeChannelRequest.run(msg.guild.id, 1, channel)

                        if (channel !== null) msg.channel.send(`${__("level_up_channel_added")} ${__("kirino_glad")}`)
                        else msg.channel.send(`${__("level_up_channel_reset")} ${__("kirino_glad")}`)
                    }
                }

                else if (request === "import")  {
                    if (!msg.member.hasPermission("ADMINISTRATOR")) return msg.channel.send(`${__("not_allowed_to_import")} ${__("kirino_pff")}`)

                    validationMessage = await msg.channel.send(__("xp_import_verification"))
    
                    validationMessage.react('✅')
                    validationMessage.react('❌')
    
                    const collector = validationMessage.createReactionCollector(filter, { max: 1, time: 30_000 })
            
                    collector.on("collect", async (reaction) => {
                        if (reaction.emoji.name === '✅') {
                            const importMessage = await msg.channel.send(__("starting_import"))

                            let players = []
                            let pagePlayers = []
                            const fetch = require("node-fetch");
        
                            let i = 0
                            do {
                                const res = await fetch(`https://mee6.xyz/api/plugins/levels/leaderboard/${msg.guild.id}?limit=1000&page=${i}`)
                                const data = await res.json()

                                if (!res.ok) return importMessage.edit(__("guild_not_found_on_mee6_api"))
        
                                pagePlayers = data.players
                                players.push(...pagePlayers)
        
                                i++
                            } while (pagePlayers.length > 0)

                            if (players.length === 0) return importMessage.edit(__("zero_xp_found_on_mee6_api"))

                            const xpDeletionRequest = bot.db.prepare("DELETE FROM xp_profiles WHERE guild_id = ?")
                            xpDeletionRequest.run(msg.guild.id)

                            const xpImportRequest = bot.db.prepare("INSERT INTO xp_profiles(guild_id, user_id, xp, total_xp, level) VALUES(?,?,?,?,?)")
                            for (const player of players) {
                                xpImportRequest.run(player.guild_id, player.id, player.detailed_xp[0], player.xp, player.level)
                            }
                            importMessage.edit(`${__("mee6_levels_successfully_imported")} ${__("kirino_glad")}`)
                        }
                        else {
                            msg.channel.send(__("import_cancelled"))
                        }
                    })   
                }

                else if (request === "color") {
                    let color = args[1]
                    if (!color) return msg.channel.send(`${__("specify_color")} ${__("kirino_pout")}`)

                    const xpRequest = bot.db.prepare("SELECT xp, total_xp, level FROM xp_profiles WHERE guild_id = ? AND user_id = ?")
                    const xpRow = xpRequest.get(msg.guild.id, msg.author.id)

                    const updateColorRequest = bot.db.prepare("INSERT INTO xp_profiles(guild_id, user_id, xp, total_xp, level, color) VALUES(?,?,?,?,?,?) ON CONFLICT(guild_id,user_id) DO UPDATE SET color=excluded.color")
                    

                    if (color === "reset") {
                        updateColorRequest.run(msg.guild.id, msg.author.id, xpRow.xp, xpRow.total_xp, xpRow.level, null)
                        msg.channel.send(`${__("color_reset")} ${__("kirino_glad")}`)
                    }
                    else {
                        if (!color.startsWith("#")) color = `#${color}`

                        const colorRegex = /^#[0-9A-F]{6}$/i
                        if (!colorRegex.test(color)) return msg.channel.send(`${__("invalid_color")} ${__("kirino_pout")}`)

                        updateColorRequest.run(msg.guild.id, msg.author.id, xpRow.xp, xpRow.total_xp, xpRow.level, color)
                        msg.channel.send(`${__("color_updated")} ${__("kirino_glad")}`)
                    }
                }

                else if (request === "background" || request === "back") {
                    const arg = args[1]

                    const updateBackground = require("../lib/update_background")
                    if (arg === "reset") {
                        updateBackground(bot.db, msg, null)
                        return msg.channel.send(`${__("background_reset")} ${__("kirino_glad")}`)
                    }

                    let url
                    if (arg !== undefined) {
                        const isImageUrl = require("is-image-url")
                        if (isImageUrl(arg)) {
                            url = arg
                        }
                    }
                    if (msg.attachments.size > 0) {
                        url = msg.attachments.first().url
                    }
                    
                    if (url === undefined) return msg.channel.send(`${__("bad_image")} ${__("kirino_pout")}`)
                    try {
                        await Canvas.loadImage(url)
                    }
                    catch {
                        return msg.channel.send(`${__("bad_image")} ${__("kirino_pout")}`)
                    }

                    updateBackground(bot.db, msg, url)

                    msg.channel.send(`${__("background_set")} ${__("kirino_glad")}`)
                }
        
                else {
                    if (!msg.guild.me.hasPermission("ATTACH_FILES")) return msg.channel.send(`${__("need_send_files")} ${__("kirino_pout")}`)
                    let member
        
                    if (args.length === 0) {
                        member = msg.member
                    }
            
                    else {
                        member = getUser(msg, args)
                        if (member === undefined) return msg.channel.send(`${__("please_correctly_write_or_mention_a_member")} ${__("kirino_pout")}`)
                        else if (member.user.bot) return msg.channel.send(`${__("bots_not_allowed")} ${__("kirino_pff")}`)
                    }
            

                    const xpRequest = bot.db.prepare("SELECT xp, level, color FROM xp_profiles WHERE guild_id = ? AND user_id = ?")
                    let xpRow = xpRequest.get(msg.guild.id, member.id)
        
                    if (xpRow === undefined) {
                        xpRow = { "xp": 0, "total_xp": 0, "level": 0 }
                        const createProfileRequest = bot.db.prepare("INSERT INTO xp_profiles(guild_id, user_id, xp, total_xp, level) VALUES(?,?,?,?,?)")
                        createProfileRequest.run(msg.guild.id, msg.author.id, xpRow.xp, xpRow.total_xp, xpRow.level)
                    }
        
                    const level = xpRow.level
                    let xp = xpRow.xp
                    let color = xpRow.color

                    if (!color) color = "#1FE7F0"
    
                    let nextLvlXp = 5 * (level * level) + 50 * level + 100
                    const percent = (xp / nextLvlXp * 100).toFixed(1)
    
                    let guildUsers = await msg.guild.members.fetch()
                    guildUsers = guildUsers.array().map(user => user.id)

                    const serverRankingRequest = bot.db.prepare("SELECT user_id FROM xp_profiles WHERE guild_id = ? ORDER BY level DESC, xp DESC")
                    const serverRankingRows = serverRankingRequest.all(msg.guild.id).map(row => row.user_id).filter(user_id => guildUsers.includes(user_id))
    
                    let rank = serverRankingRows.indexOf(member.id) + 1
                    if (rank === 0) rank = serverRankingRows.length + 1

                    const canvas = Canvas.createCanvas(934, 282)
                    const ctx = canvas.getContext("2d")

                    const backgroundUrlRequest = bot.db.prepare("SELECT background FROM xp_profiles WHERE guild_id = ? AND user_id = ?")
                    let backgroundUrl = backgroundUrlRequest.get(msg.guild.id, msg.author.id)
                    if (backgroundUrl !== undefined) backgroundUrl = backgroundUrl.background

                    if (backgroundUrl !== null && backgroundUrl !== undefined) {
                        try {
                            const background = await Canvas.loadImage(backgroundUrl)
                            ctx.drawImage(background, 0, 0, canvas.width, canvas.height)
                        }
                        catch {
                            const updateBackground = require("../lib/update_background")
                            updateBackground(bot.db, msg, null)
                            
                            ctx.fillStyle = "black"
                            ctx.fillRect(0, 0, canvas.width, canvas.height)
                        }
                    }
                    else {
                        ctx.fillStyle = "black"
                        ctx.fillRect(0, 0, canvas.width, canvas.height) // default is a black background
                    }
    
                    ctx.strokeStyle = color
                    ctx.strokeRect(0, 0, canvas.width, canvas.height) // border

                    ctx.lineWidth = 0.5
    
                    const totalName = member.user.tag.split("#")
                    const tag = totalName.pop()
                    let username = totalName.join("#")
    
                    ctx.font = "25px ubuntu"
                    const spaceMeasure = ctx.measureText(" ")
    
                    ctx.font = "40px ubuntu"
                    ctx.fillStyle = "#FFFFFF"
                    ctx.strokeStyle = "black"
                    let usernameMeasure = ctx.measureText(username)

                    let tooLongText = ""
                    let usernameTotalMeasure = usernameMeasure.width
                    if (usernameMeasure.width > 270) {
                        let i = 0
                        let sum = 0
                        for (const char of username) {
                            const charMeasure = ctx.measureText(char)
                            sum += charMeasure.width
                            i++
                            if (sum > 270) break
                        }
                        
                        if (i !== username.length - 1) {
                            username = username.substring(0, i)
                            tooLongText = "..."
                        }
                        usernameMeasure = ctx.measureText(username)
                        ctx.font = "30px ubuntu"
                        tooLongTextMeasure = ctx.measureText(tooLongText)
                        usernameTotalMeasure = usernameMeasure.width + tooLongTextMeasure.width
                    }

                    ctx.font = "40px ubuntu"
                    ctx.fillText(username, 270, 176)
                    ctx.strokeText(username, 270, 176)
                    ctx.font = "30px ubuntu"
                    ctx.fillText(tooLongText, 270 + usernameMeasure.width, 176)
                    ctx.strokeText(tooLongText, 270 + usernameMeasure.width, 176)
                    ctx.font = "21px ubuntu"
                    ctx.fillStyle = "#AAAAAA"

                    ctx.lineWidth = 0.25
                    
                    ctx.fillText("#" + tag, usernameTotalMeasure + 275, 176)
                    ctx.strokeText("#" + tag, usernameTotalMeasure + 275, 176)

                    ctx.lineWidth = 0.5
    
                    ctx.fillStyle = color // level
                    ctx.font = "70px ubuntu"
                    const levelMeasure = ctx.measureText(level)
                    const offsetLevel = canvas.width - levelMeasure.width - 40
                    ctx.fillText(level, offsetLevel, 85)
                    ctx.strokeText(level, offsetLevel, 85)
    
                    ctx.font = "25px ubuntu" // level prefix
                    const levelPrefix = __("level").toUpperCase()
                    const levelPrefixMeasure = ctx.measureText(levelPrefix)
                    const offsetLevelPrefix = offsetLevel - levelPrefixMeasure.width - spaceMeasure.width * 2
                    ctx.fillText(levelPrefix, offsetLevelPrefix, 85)
                    ctx.strokeText(levelPrefix, offsetLevelPrefix, 85)
    
                    ctx.fillStyle = "#FFFFFF"
                    ctx.font = "70px ubuntu" // rank
                    const rankMeasure = ctx.measureText(`#${rank}`)
                    const offsetRank = offsetLevelPrefix - rankMeasure.width - 20
                    ctx.fillText(`#${rank}`, offsetRank, 85)
                    ctx.strokeText(`#${rank}`, offsetRank, 85)
    
                    ctx.font = "25px ubuntu" // rank prefix
                    const rankPrefix = __("rank").toUpperCase()
                    const rankPrefixMeasure = ctx.measureText(rankPrefix)
                    const offsetRankPrefix = offsetRank - rankPrefixMeasure.width - spaceMeasure.width * 2
                    ctx.fillText(rankPrefix, offsetRankPrefix, 85)
                    ctx.strokeText(rankPrefix, offsetRankPrefix, 85)
    
                    if (level < 100) {
                        ctx.fillStyle = "#AAAAAA" // next level xp
                        if (nextLvlXp >= 1000) nextLvlXp = (nextLvlXp / 1000).toPrecision(3) + "K"
                        const nextLvlXpMeasure = ctx.measureText(`/ ${nextLvlXp} XP`)
                        const offsetNextLvlXpMeasure = canvas.width - nextLvlXpMeasure.width - 50
                        ctx.fillText(`/ ${nextLvlXp} XP`, offsetNextLvlXpMeasure, 176)
                        ctx.strokeText(`/ ${nextLvlXp} XP`, offsetNextLvlXpMeasure, 176)
        
                        ctx.fillStyle = "#FFFFFF" // current xp
                        if (xp >= 1000) xp = (xp / 1000).toPrecision(3) + "K"
                        const xpMeasure = ctx.measureText(xp)
                        const offsetXp = offsetNextLvlXpMeasure - xpMeasure.width - spaceMeasure.width
                        ctx.fillText(xp, offsetXp, 176)
                        ctx.strokeText(xp, offsetXp, 176)
    
                        ctx.save()
    
                        const progressBarWidth = 620
                        const progressBarHeight = 40
                        
                        ctx.fillStyle = "#555555" // progress bar background
                        ctx.beginPath()
                        ctx.roundedRectangle(270, 200, progressBarWidth, progressBarHeight, 20)
                        ctx.fill()
                        ctx.stroke()
                        ctx.clip()
    
                        ctx.fillStyle = color // progress bar foreground
                        ctx.beginPath()
                        const offsetXpBar = percent / 100 * progressBarWidth
                        ctx.roundedRectangle(270, 200, offsetXpBar, progressBarHeight, 20)
                        ctx.fill()
    
                        ctx.restore()
                    }
    
                    else {
                        ctx.fillStyle = color // max reached
                        ctx.font = "70px ubuntu"
                        ctx.fillText(__("max_reached"), 320, 255)
                        ctx.strokeText(__("max_reached"), 320, 255)
                    }                
    
                    ctx.beginPath() // user avatar circle filter
                    ctx.arc(140, 140, 100, 0, Math.PI * 2, true)
                    ctx.closePath()
                    ctx.clip()
    
                    const avatar = await Canvas.loadImage(member.user.displayAvatarURL({ format: "png" }))
                    ctx.drawImage(avatar, 40, 40, 200, 200)
    
                    const Discord = require("discord.js")
                    const card = new Discord.MessageAttachment(canvas.toBuffer(), "card.png")
    
                    msg.channel.send(card)
                }
            }
            else msg.channel.send(`${__("currently_disabled_enable_with")} \`${bot.prefix}xp enable\`.`)
        }
    }
}

Canvas.CanvasRenderingContext2D.prototype.roundedRectangle = function(x, y, width, height, rounded) {
    const halfRadians = (2 * Math.PI) / 2
    const quarterRadians = (2 * Math.PI) / 4  
    this.arc(rounded + x, rounded + y, rounded, -quarterRadians, halfRadians, true)
    this.lineTo(x, y + height - rounded)
    this.arc(rounded + x, height - rounded + y, rounded, halfRadians, quarterRadians, true)  
    this.lineTo(x + width - rounded, y + height)
    this.arc(x + width - rounded, y + height - rounded, rounded, quarterRadians, 0, true)  
    this.lineTo(x + width, y + rounded)  
    this.arc(x + width - rounded, y + rounded, rounded, 0, -quarterRadians, true)  
    this.lineTo(x + rounded, y)  
}