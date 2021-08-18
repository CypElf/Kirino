const { SlashCommandBuilder } = require("@discordjs/builders")
const { MessageAttachment, Permissions } = require("discord.js")
const Canvas = require("canvas")
const updateBackground = require("../../lib/misc/update_background")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("xp")
        .setDescription("Display the XP card of a user")
        .addUserOption(option => option.setName("user").setDescription("The user you want to see the XP card. Default is yourself")),
    guildOnly: false,
    cooldown: 1,

    async execute(bot, interaction) {

        if (bot.db.prepare("SELECT is_enabled FROM xp_guilds WHERE guild_id = ?").get(interaction.guild.id)?.is_enabled) {
            if (!interaction.guild.me.permissions.has(Permissions.FLAGS.ATTACH_FILES)) return interaction.reply({ content: `${__("need_send_files")} ${__("kirino_pout")}`, ephemeral: true })

            const user = interaction.options.getUser("user") ?? interaction.user
            if (user.bot) return interaction.reply({ content: `${__("bots_not_allowed")} ${__("kirino_pff")}`, ephemeral: true })

            await interaction.deferReply()

            let xpRow = bot.db.prepare("SELECT xp, level, color FROM xp_profiles WHERE guild_id = ? AND user_id = ?").get(interaction.guild.id, user.id)
            if (xpRow === undefined) xpRow = { "xp": 0, "total_xp": 0, "level": 0 }

            const { level } = xpRow
            let { xp, color } = xpRow

            if (!color) color = "#1FE7F0"

            let nextLvlXp = 5 * (level * level) + 50 * level + 100
            const percent = (xp / nextLvlXp * 100).toFixed(1)

            const serverRankingRows = bot.db.prepare("SELECT user_id FROM xp_profiles WHERE guild_id = ? ORDER BY level DESC, xp DESC").all(interaction.guild.id).map(row => row.user_id).filter(async user_id => {
                try {
                    await bot.users.fetch(user_id)
                    return true
                }
                catch {
                    return false
                }
            })

            let rank = serverRankingRows.indexOf(user.id) + 1
            if (rank === 0) rank = serverRankingRows.length + 1

            const canvas = Canvas.createCanvas(934, 282)
            const ctx = canvas.getContext("2d")

            const backgroundUrl = bot.db.prepare("SELECT background FROM xp_profiles WHERE guild_id = ? AND user_id = ?").get(interaction.guild.id, user.id)?.background

            if (backgroundUrl !== null && backgroundUrl !== undefined) {
                try {
                    const background = await Canvas.loadImage(backgroundUrl)
                    ctx.drawImage(background, 0, 0, canvas.width, canvas.height)
                }
                catch {
                    updateBackground(bot.db, null, interaction.user.id, interaction.guild.id)

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

            const totalName = user.tag.split("#")
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

            const avatar = await Canvas.loadImage(user.displayAvatarURL({ format: "png" }))
            ctx.drawImage(avatar, 40, 40, 200, 200)

            const card = new MessageAttachment(canvas.toBuffer(), "card.png")

            interaction.editReply({ files: [card] })

        }
        else interaction.reply({ content: `${__("currently_disabled_enable_with")} \`${bot.prefix}xp enable\`.`, ephemeral: true })
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