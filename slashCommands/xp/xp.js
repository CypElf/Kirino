const { SlashCommandBuilder } = require("@discordjs/builders")
const { MessageAttachment, Permissions } = require("discord.js")
const t = require("i18next").t.bind(require("i18next"))
const Canvas = require("canvas")
const fetch = require("node-fetch")
const updateBackground = require("../../lib/misc/update_background")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("xp")
        .setDescription("Allow to consult you XP card, config the XP system or customize some of its elements")
        .addSubcommandGroup(option => option.setName("color").setDescription("Allow you to change or reset the color of your XP card").addSubcommand(option => option.setName("set").setDescription("Allow you to change the color of your XP card").addStringOption(option => option.setName("color").setDescription("The hexadecimal color code of the color you want").setRequired(true))).addSubcommand(option => option.setName("reset").setDescription("Reset the color of your XP card to the default")))
        .addSubcommandGroup(option => option.setName("background").setDescription("Allow you to change or remove the custom background of your XP card").addSubcommand(option => option.setName("set").setDescription("Allow you to change the custom background of your XP card").addStringOption(option => option.setName("link").setDescription("A link to the image to set as the new custom background").setRequired(true))).addSubcommand(option => option.setName("reset").setDescription("Remove the custom background from your XP card")))
        .addSubcommandGroup(option => option.setName("channel").setDescription("Allow you to change or remove the fixed channel for level up messages").addSubcommand(option => option.setName("get").setDescription("Allow you to know in what channel are currently sent the level up messages")).addSubcommand(option => option.setName("set").setDescription("Allow you to change the fixed channel for level up messages").addChannelOption(option => option.setName("channel").setDescription("The new channel for the level up messages").setRequired(true))).addSubcommand(option => option.setName("reset").setDescription("Remove the fixed channel for level up messages and restore the default behavior")))
        .addSubcommandGroup(option => option.setName("reset").setDescription("Allow you to reset the level of a member or the whole server").addSubcommand(option => option.setName("user").setDescription("Reset the level of a member in the server").addUserOption(option => option.setName("user").setDescription("The user you want to reset the level. If not specified, default is yourself"))).addSubcommand(option => option.setName("all").setDescription("Reset all the levels in the server")))
        .addSubcommandGroup(option => option.setName("message").setDescription("Allow you to change or reset to the default the level up message").addSubcommand(option => option.setName("set").setDescription("Change the level up message").addStringOption(option => option.setName("message").setDescription("The new level up message").setRequired(true))).addSubcommand(option => option.setName("reset").setDescription("Reset the level up message to the default")))
        .addSubcommand(option => option.setName("enable").setDescription("Enable the XP system"))
        .addSubcommand(option => option.setName("disable").setDescription("Disable the XP system"))
        .addSubcommand(option => option.setName("import").setDescription("Import the level from MEE6's XP system"))
        .addSubcommand(option => option.setName("get").setDescription("Display the XP card of a user").addUserOption(option => option.setName("user").setDescription("The user you want to get the XP card"))),

    guildOnly: true,
    cooldown: 3,
    permissions: ["{administrator}"],

    async execute(bot, interaction) {
        const isEnabled = bot.db.prepare("SELECT is_enabled FROM xp_guilds WHERE guild_id = ?").get(interaction.guild.id)?.is_enabled

        const subcommand = interaction.options.getSubcommand()
        const subcommandGroup = interaction.options.getSubcommandGroup(false)

        if (subcommand === "enable" || subcommand === "disable") {
            if (!interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) return interaction.reply({ content: `${t("not_allowed_to_enable_or_disable")} ${t("common:kirino_pff")}`, ephemeral: true })
            const enableRequest = bot.db.prepare("INSERT INTO xp_guilds(guild_id,is_enabled) VALUES(?,?) ON CONFLICT(guild_id) DO UPDATE SET is_enabled=excluded.is_enabled")

            if (subcommand === "enable") {
                if (isEnabled) return interaction.reply({ content: `${t("xp_already_enabled")} ${t("common:kirino_pout")}`, ephemeral: true })
                enableRequest.run(interaction.guild.id, 1)
                interaction.reply(`${t("xp_enabled")} ${t("common:kirino_glad")}`)
            }

            else {
                if (!isEnabled) return interaction.reply({ content: `${t("xp_already_disabled")} ${t("common:kirino_pout")}`, ephemeral: true })
                enableRequest.run(interaction.guild.id, 0)
                interaction.reply(`${t("xp_disabled")} ${t("common:kirino_glad")}`)
            }
        }

        else if (isEnabled) {
            const filter = (reaction, user) => {
                return reaction.emoji.name === "✅" && user.id === interaction.user.id || reaction.emoji.name === "❌" && user.id === interaction.user.id
            }

            if (subcommandGroup === "reset") {
                if (!interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) return interaction.reply({ content: `${t("not_allowed_to_reset_xp")} ${t("common:kirino_pff")}`, ephemeral: true })
                if (!interaction.guild.me.permissions.has(Permissions.FLAGS.ADD_REACTIONS)) return interaction.reply({ content: `${t("cannot_react_to_messages")} ${t("common:kirino_pout")}`, ephemeral: true })

                if (subcommand === "all") {
                    await interaction.reply(t("server_xp_reset_validation"))
                    const validationMessage = await interaction.fetchReply()

                    validationMessage.react("✅")
                    validationMessage.react("❌")

                    const collector = validationMessage.createReactionCollector({ filter, max: 1, time: 30_000 })

                    collector.on("collect", (reaction) => {
                        if (reaction.emoji.name === "✅") {
                            const profiles = bot.db.prepare("SELECT * FROM xp_profiles WHERE guild_id = ?").all(interaction.guild.id)

                            for (const profile of profiles) {
                                bot.db.prepare("INSERT INTO xp_profiles(guild_id, user_id, xp, total_xp, level) VALUES(?,?,?,?,?) ON CONFLICT(guild_id, user_id) DO UPDATE SET xp=excluded.xp, total_xp=excluded.total_xp, level=excluded.level").run(profile.guild_id, profile.user_id, 0, 0, 0)
                                bot.db.prepare("DELETE FROM xp_profiles WHERE guild_id = ? AND color IS NULL AND background IS NULL").run(profile.guild_id)
                            }

                            interaction.followUp(`${t("server_xp_successfully_reset")} ${t("common:kirino_glad")}`)
                        }
                        else {
                            interaction.followUp(t("server_xp_canceled"))
                        }
                    })
                }
                else {
                    const user = interaction.options.getUser("user") ?? interaction.user

                    if (user.bot) return interaction.reply({ content: `${t("bots_not_allowed")} ${t("common:kirino_pout")}`, ephemeral: true })

                    const isInXpTable = bot.db.prepare("SELECT * FROM xp_profiles WHERE guild_id = ? AND user_id = ?").get(interaction.guild.id, user.id)

                    if (!isInXpTable) return interaction.reply({ content: t("member_zero_xp"), ephemeral: true })

                    if (user.id === interaction.user.id) await interaction.reply(t("your_xp_reset_validation"))
                    else await interaction.reply(`${t("are_you_sure_you_want_to_reset")} ${user.username}${t("'s_xp")}`)

                    const validationMessage = await interaction.fetchReply()

                    validationMessage.react("✅")
                    validationMessage.react("❌")

                    const collector = validationMessage.createReactionCollector({ filter, max: 1, time: 30_000 })

                    collector.on("collect", (reaction) => {
                        if (reaction.emoji.name === "✅") {
                            bot.db.prepare("INSERT INTO xp_profiles(guild_id, user_id, xp, total_xp, level) VALUES(?,?,?,?,?) ON CONFLICT(guild_id, user_id) DO UPDATE SET xp=excluded.xp, total_xp=excluded.total_xp, level=excluded.level").run(interaction.guild.id, user.id, 0, 0, 0)

                            if (user.id === interaction.user.id) interaction.followUp(`${t("your_xp_successfully_reset")} ${t("common:kirino_glad")}`)
                            else interaction.followUp(`${t("xp_reset_of")}${user.username}${t("successfully_reset")} ${t("common:kirino_glad")}`)
                        }
                        else {
                            interaction.followUp(`${t("xp_reset_of")}${user.username}${t("cancelled")}`)
                        }
                    })
                }
            }

            else if (subcommandGroup === "message") {
                if (!interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) return interaction.reply({ content: `${t("not_allowed_to_change_lvl_up_msg")} ${t("common:kirino_pff")}`, ephemeral: true })

                const newMsg = subcommand === "reset" ? null : interaction.options.getString("message")
                bot.db.prepare("INSERT INTO xp_guilds(guild_id, is_enabled, level_up_message) VALUES(?,?,?) ON CONFLICT(guild_id) DO UPDATE SET level_up_message=excluded.level_up_message").run(interaction.guild.id, 1, newMsg)

                if (subcommand === "reset") interaction.reply(`${t("lvl_up_msg_reset")} ${t("common:kirino_glad")}`)
                else interaction.reply(`${t("lvl_up_msg_updated")} ${t("common:kirino_glad")}`)
            }

            else if (subcommandGroup === "channel") {
                if (subcommand === "get") {
                    let channel = bot.db.prepare("SELECT level_up_channel_id FROM xp_guilds WHERE guild_id = ?").get(interaction.guild.id).level_up_channel_id

                    if (channel === null) interaction.reply(`${t("no_level_up_channel")} ${t("common:kirino_glad")}`)
                    else {
                        channel = await interaction.guild.channels.fetch(channel)
                        if (channel === undefined) {
                            bot.db.prepare("INSERT INTO xp_guilds(guild_id, is_enabled, level_up_channel_id) VALUES(?,?,?) ON CONFLICT(guild_id) DO UPDATE SET level_up_channel_id=excluded.level_up_channel_id").run(interaction.guild.id, 1, null)

                            interaction.reply(`${t("no_level_up_channel")} ${t("common:kirino_glad")}`)
                        }
                        else {
                            interaction.reply(`${t("level_up_channel_is")} <#${channel.id}>. ${t("common:kirino_glad")}`)
                        }
                    }
                }
                else {
                    if (!interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) return interaction.reply({ content: `${t("not_allowed_to_change_channel")} ${t("common:kirino_pff")}`, ephemeral: true })

                    const channel = subcommand === "reset" ? null : interaction.options.getChannel("channel")

                    if (subcommand === "set" && !channel.isText()) return interaction.reply({ content: `${t("not_a_text_channel")} ${t("common:kirino_pout")}`, ephemeral: true })

                    bot.db.prepare("INSERT INTO xp_guilds(guild_id, is_enabled, level_up_channel_id) VALUES(?,?,?) ON CONFLICT(guild_id) DO UPDATE SET level_up_channel_id=excluded.level_up_channel_id").run(interaction.guild.id, 1, channel ? channel.id : null)

                    if (channel !== null) interaction.reply(`${t("the_channel")} <#${channel.id}> ${t("has_been_set_as_level_up_channel")} ${t("common:kirino_glad")}`)
                    else interaction.reply(`${t("level_up_channel_reset")} ${t("common:kirino_glad")}`)
                }
            }

            else if (subcommand === "import") {
                if (!interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) return interaction.reply({ content: `${t("not_allowed_to_import")} ${t("common:kirino_pff")}`, ephemeral: true })

                await interaction.reply(t("xp_import_verification"))
                const validationMessage = await interaction.fetchReply()

                validationMessage.react("✅")
                validationMessage.react("❌")

                const collector = validationMessage.createReactionCollector({ filter, max: 1, time: 30_000 })

                collector.on("collect", async (reaction) => {
                    if (reaction.emoji.name === "✅") {
                        const importMessage = await interaction.followUp(t("starting_import"))

                        const players = []
                        let pagePlayers = []

                        let i = 0
                        do {
                            const res = await fetch(`https://mee6.xyz/api/plugins/levels/leaderboard/${interaction.guild.id}?limit=1000&page=${i}`)
                            const data = await res.json()

                            if (!res.ok) return importMessage.edit(t("guild_not_found_on_mee6_api"))

                            pagePlayers = data.players
                            players.push(...pagePlayers)

                            i++
                        } while (pagePlayers.length > 0)

                        if (players.length === 0) return importMessage.edit(t("zero_xp_found_on_mee6_api"))

                        const oldPlayersRow = bot.db.prepare("SELECT user_id, color, background FROM xp_profiles WHERE guild_id = ?").all(interaction.guild.id)
                        bot.db.prepare("DELETE FROM xp_profiles WHERE guild_id = ?").run(interaction.guild.id)

                        for (const player of players) {
                            let color = null
                            let background = null

                            const filtered = oldPlayersRow.filter(row => row.user_id === player.id)
                            if (filtered.length > 0) {
                                color = filtered[0].color
                                background = filtered[0].background
                            }

                            bot.db.prepare("INSERT INTO xp_profiles VALUES(?,?,?,?,?,?,?)").run(player.guild_id, player.id, player.detailed_xp[0], player.xp, player.level, color, background)
                        }
                        importMessage.edit(`${t("mee6_levels_successfully_imported")} ${t("common:kirino_glad")}`)
                    }
                    else {
                        interaction.followUp(t("import_cancelled"))
                    }
                })
            }

            else if (subcommandGroup === "color") {
                const xpRow = bot.db.prepare("SELECT xp, total_xp, level FROM xp_profiles WHERE guild_id = ? AND user_id = ?").get(interaction.guild.id, interaction.user.id)

                const updateColorRequest = bot.db.prepare("INSERT INTO xp_profiles(guild_id, user_id, xp, total_xp, level, color) VALUES(?,?,?,?,?,?) ON CONFLICT(guild_id,user_id) DO UPDATE SET color=excluded.color")

                if (subcommand === "reset") {
                    updateColorRequest.run(interaction.guild.id, interaction.user.id, xpRow.xp, xpRow.total_xp, xpRow.level, null)
                    interaction.reply(`${t("color_reset")} ${t("common:kirino_glad")}`)
                }
                else {
                    let color = interaction.options.getString("color")
                    if (!color.startsWith("#")) color = `#${color}`

                    const colorRegex = /^#[0-9A-F]{6}$/i
                    if (!colorRegex.test(color)) return interaction.reply({ content: `${t("invalid_color")} ${t("common:kirino_pout")}`, ephemeral: true })

                    updateColorRequest.run(interaction.guild.id, interaction.user.id, xpRow.xp, xpRow.total_xp, xpRow.level, color)
                    interaction.reply(`${t("color_updated")} ${t("common:kirino_glad")}`)
                }
            }

            else if (subcommandGroup === "background") {
                if (subcommand === "reset") {
                    updateBackground(bot.db, null, interaction.user.id, interaction.guild.id)
                    return interaction.reply(`${t("background_reset")} ${t("common:kirino_glad")}`)
                }

                const link = interaction.options.getString("link")

                try {
                    await Canvas.loadImage(link)
                }
                catch {
                    return interaction.reply({ content: `${t("bad_image")} ${t("common:kirino_pout")}`, ephemeral: true })
                }

                updateBackground(bot.db, link, interaction.user.id, interaction.guild.id)

                interaction.reply(`${t("background_set")} ${t("common:kirino_glad")}`)
            }

            else if (subcommand === "get") {
                if (!interaction.guild.me.permissions.has(Permissions.FLAGS.ATTACH_FILES)) return interaction.reply({ content: `${t("need_send_files")} ${t("common:kirino_pout")}`, ephemeral: true })

                const user = interaction.options.getUser("user") ?? interaction.user
                if (user.bot) return interaction.reply({ content: `${t("bots_not_allowed")} ${t("common:kirino_pff")}`, ephemeral: true })

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
                const levelPrefix = t("level").toUpperCase()
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
                const rankPrefix = t("rank").toUpperCase()
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
                    ctx.fillText(t("max_reached"), 320, 255)
                    ctx.strokeText(t("max_reached"), 320, 255)
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
        }
        else interaction.reply({ content: `${t("currently_disabled_enable_with")} \`xpconfig enable\`.`, ephemeral: true })
    }
}