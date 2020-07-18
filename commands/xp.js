const Canvas = require("canvas")

module.exports = {
	name: "xp",
    description: "description_xp",
    guildOnly: true,
    args: false,
    cooldown: 5,
    category: "utility",
    usage: "usage_xp",

    async execute (bot, msg, args) {
        const getUser = require("../res/get_user")
        const bsqlite3 = require("better-sqlite3")
        const db = new bsqlite3("database.db", { fileMustExist: true })

        const request = args[0]

        if (request === "enable" || request === "disable") {
            const enableRequest = db.prepare("INSERT INTO xp_activations(guild_id,enabled) VALUES(?,?) ON CONFLICT(guild_id) DO UPDATE SET enabled=excluded.enabled")
            const alreadyEnabledRequest = db.prepare("SELECT enabled FROM xp_activations WHERE guild_id = ?")
            const isAlreadyEnabled = alreadyEnabledRequest.get(msg.guild.id).enabled

            if (request === "enable") {
                if (isAlreadyEnabled) return msg.channel.send("XP system already enabled.")
                enableRequest.run(msg.guild.id, 1)
                msg.channel.send("XP system enabled!")
            }

            else {
                if (!isAlreadyEnabled) return msg.channel.send("XP system already disabled.")
                enableRequest.run(msg.guild.id, 0)
                msg.channel.send("XP system disabled!")
            }
        }

        else if (request === "reset") {
            if (!msg.member.hasPermission("ADMINISTRATOR")) return msg.channel.send("You're not allowed to reset XP profiles.")
            if (!msg.guild.me.hasPermission("ADD_REACTIONS")) return msg.channel.send(__("cannot_react_to_messages") + " <:kirinopout:698923065773522944>")

            args.shift()
            const filter = (reaction, user) => {
                return reaction.emoji.name === '✅' && user.id === msg.author.id || reaction.emoji.name === '❌' && user.id === msg.author.id
            }

            if (args[0] === "all") {
                const validationMessage = await msg.channel.send(`Are you sure you want to reset the XP for all the server?`)

                validationMessage.react('✅')
                validationMessage.react('❌')

                const collector = validationMessage.createReactionCollector(filter, { max: 1, time: 30_000 })
        
                collector.on("collect", (reaction) => {
                    if (reaction.emoji.name === '✅') {
                        const profileDeletionRequest = db.prepare("DELETE FROM xp WHERE guild_id = ?")
                        profileDeletionRequest.run(msg.guild.id)
                        msg.channel.send(`All the server XP records have been successfully deleted.`)
                    }
                    else {
                        msg.channel.send(`The XP reset of the entire server has been cancelled.`)
                    }
                })


                
            }
            else {
                let member
                if (args[0] === undefined) member = msg.member
                else member = getUser(msg, args)
                if (!member) return msg.channel.send(__("please_correctly_write_or_mention_a_member") + " <:kirinopout:698923065773522944>")
                else if (member.user.bot) return msg.channel.send("Bots are not allowed")
                
                const isInXpTableRequest = db.prepare("SELECT * FROM xp WHERE guild_id = ? AND user_id = ?")
                const isInXpTable = isInXpTableRequest.get(msg.guild.id, member.id)

                if (!isInXpTable) return msg.channel.send("This member is not registered in the XP system yet.")

                const validationMessage = await msg.channel.send(`Are you sure you want to reset ${member.user.username}'s XP?`)

                validationMessage.react('✅')
                validationMessage.react('❌')

                const collector = validationMessage.createReactionCollector(filter, { max: 1, time: 30_000 })
        
                collector.on("collect", (reaction) => {
                    if (reaction.emoji.name === '✅') {
                        const profileDeletionRequest = db.prepare("DELETE FROM xp WHERE guild_id = ? AND user_id = ?")
                        profileDeletionRequest.run(msg.guild.id, member.id)
                        msg.channel.send(`${member.user.username}'s XP profile has been successfully deleted.`)
                    }
                    else {
                        msg.channel.send(`${member.user.username}'s XP profile reset have been cancelled.`)
                    }
                })
            }
        }

        else {
            let member

            if (args.length === 0) {
                member = msg.member
            }
    
            else {
                member = getUser(msg, args)
                if (member === undefined) return msg.channel.send(__("please_correctly_write_or_mention_a_member") + " <:kirinopout:698923065773522944>")
                else if (member.user.bot) return msg.channel.send("Bots are not allowed")
            }
            
            const xpActivationRequest = db.prepare("SELECT enabled FROM xp_activations WHERE guild_id = ?")
            let isEnabled = xpActivationRequest.get(msg.guild.id).enabled
    
            if (isEnabled === undefined) {
                isEnabled = 0
                const xpDisabledRequest = db.prepare("INSERT INTO xp_activations(guild_id,enabled) VALUES(?,?)")
                xpDisabledRequest.run(msg.guild.id, 0)
            }
    
            if (isEnabled) {
                const xpRequest = db.prepare("SELECT xp, level FROM xp WHERE guild_id = ? AND user_id = ?")
                let xpRow = xpRequest.get(msg.guild.id, member.id)
    
                if (xpRow === undefined) return msg.channel.send("The designated member has not gained any XP yet.")
    
                const level = xpRow.level
                let xp = xpRow.xp

                let nextLvlXp = 5 * (level * level) + 50 * level + 100
                const percent = (xp / nextLvlXp * 100).toFixed(1)

                const serverRankingRequest = db.prepare("SELECT user_id FROM xp WHERE guild_id = ? ORDER BY level DESC, xp DESC")
                const serverRankingRows = serverRankingRequest.all(msg.guild.id).map(row => row.user_id)

                const rank = serverRankingRows.indexOf(member.id) + 1
                    
                const canvas = Canvas.createCanvas(934, 282)
                const ctx = canvas.getContext("2d")

                ctx.fillStyle = "black"
                ctx.fillRect(0, 0, canvas.width, canvas.height) // black background

                ctx.strokeStyle = "#CCCC44"
                ctx.strokeRect(0, 0, canvas.width, canvas.height) // border

                const totalName = member.user.tag.split("#")
                const tag = totalName.pop()
                const username = totalName.join("#")

                ctx.font = "25px ubuntu"
                const spaceMeasure = ctx.measureText(" ")

                ctx.font = "40px ubuntu" // username and tag
                ctx.fillStyle = "#FFFFFF"
                const usernameMeasure = ctx.measureText(username)
                ctx.fillText(username, 270, 176)
                ctx.font = "23px ubuntu"
                ctx.fillStyle = "#AAAAAA"
                ctx.fillText("#" + tag, usernameMeasure.width + 280, 176)

                ctx.fillStyle = "#CCCC44" // level
                ctx.font = "70px ubuntu"
                const levelMeasure = ctx.measureText(level)
                const offsetLevel = canvas.width - levelMeasure.width - 40
                ctx.fillText(level, offsetLevel, 85)

                ctx.font = "25px ubuntu" // level prefix
                const levelPrefixMeasure = ctx.measureText("LEVEL")
                const offsetLevelPrefix = offsetLevel - levelPrefixMeasure.width - spaceMeasure.width * 2
                ctx.fillText("LEVEL", offsetLevelPrefix, 85)

                ctx.fillStyle = "#FFFFFF"
                ctx.font = "70px ubuntu" // rank
                const rankMeasure = ctx.measureText(`#${rank}`)
                const offsetRank = offsetLevelPrefix - rankMeasure.width - 20
                ctx.fillText(`#${rank}`, offsetRank, 85)

                ctx.font = "25px ubuntu" // rank prefix
                const rankPrefixMeasure = ctx.measureText("RANK")
                const offsetRankPrefix = offsetRank - rankPrefixMeasure.width - spaceMeasure.width * 2
                ctx.fillText("RANK", offsetRankPrefix, 85)

                if (level < 100) {
                    ctx.fillStyle = "#AAAAAA" // next level xp
                    if (nextLvlXp >= 1000) nextLvlXp = (nextLvlXp / 1000).toPrecision(3) + "K"
                    const nextLvlXpMeasure = ctx.measureText(`/ ${nextLvlXp} XP`)
                    const offsetNextLvlXpMeasure = canvas.width - nextLvlXpMeasure.width - 50
                    ctx.fillText(`/ ${nextLvlXp} XP`, offsetNextLvlXpMeasure, 176)
    
                    ctx.fillStyle = "#FFFFFF" // current xp
                    if (xp >= 1000) xp = (xp / 1000).toPrecision(3) + "K"
                    const xpMeasure = ctx.measureText(xp)
                    const offsetXp = offsetNextLvlXpMeasure - xpMeasure.width - spaceMeasure.width
                    ctx.fillText(xp, offsetXp, 176)

                    ctx.save()

                    const progressBarWidth = 620
                    const progressBarHeight = 40
                    
                    ctx.fillStyle = "#555555" // progress bar background
                    ctx.beginPath()
                    ctx.roundedRectangle(270, 200, progressBarWidth, progressBarHeight, 20)
                    ctx.fill()
                    ctx.clip()

                    ctx.fillStyle = "#CCCC44" // progress bar foreground
                    ctx.beginPath()
                    const offsetXpBar = percent / 100 * progressBarWidth
                    ctx.roundedRectangle(270, 200, offsetXpBar, progressBarHeight, 20)
                    ctx.fill()

                    ctx.restore()
                }

                else {
                    ctx.fillStyle = "#CCCC44" // max reached
                    ctx.font = "70px ubuntu"
                    ctx.fillText("MAX REACHED", 320, 255)
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
    
            else {
                msg.channel.send(`The XP system is currently disabled. You must first activate it with the command \`${bot.prefix}xp enable\`.`)
            }
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