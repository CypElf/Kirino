import { SlashCommandBuilder } from "@discordjs/builders"
import { ChatInputCommandInteraction, AttachmentBuilder, PermissionFlagsBits, ActionRowBuilder, GuildMember, Message, ButtonInteraction, ButtonBuilder, ButtonStyle, ComponentType, ChannelType } from "discord.js"
import i18next from "i18next"
import Canvas from "canvas"
import fetch from "node-fetch"
import { CanvasRenderingContext2D } from "canvas"
import { KirinoCommand, Kirino } from "../../lib/misc/types"
import { denied, error, success, what } from "../../lib/misc/format"
import { XpGuild, XpProfile } from "../../lib/misc/database"
import { Database } from "better-sqlite3"

const t = i18next.t.bind(i18next)

export const command: KirinoCommand = {
    builder: new SlashCommandBuilder()
        .setName("xp")
        .setDescription("Allow to consult your XP card, config the XP system or customize some of its elements")
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
    permissions: ["{administrator}"],

    async execute(bot: Kirino, interaction: ChatInputCommandInteraction) {
        if (!interaction.guild) return
        const member = interaction.member as GuildMember | null

        const isEnabled = (bot.db.prepare("SELECT is_enabled FROM xp_guilds WHERE guild_id = ?").get(interaction.guild?.id) as XpGuild | null)?.is_enabled
        const subcommand = interaction.options.getSubcommand()
        const subcommandGroup = interaction.options.getSubcommandGroup(false)

        if (subcommand === "enable" || subcommand === "disable") {
            if (member && !member.permissions.has(PermissionFlagsBits.Administrator)) return interaction.reply({ content: denied(t("not_allowed_to_enable_or_disable")), ephemeral: true })
            const enableRequest = bot.db.prepare("INSERT INTO xp_guilds(guild_id,is_enabled) VALUES(?,?) ON CONFLICT(guild_id) DO UPDATE SET is_enabled=excluded.is_enabled")

            if (subcommand === "enable") {
                if (isEnabled) return interaction.reply({ content: error(t("xp_already_enabled")), ephemeral: true })
                enableRequest.run(interaction.guild.id, 1)
                interaction.reply(success(t("xp_enabled")))
            }

            else {
                if (!isEnabled) return interaction.reply({ content: error(t("xp_already_disabled")), ephemeral: true })
                enableRequest.run(interaction.guild.id, 0)
                interaction.reply(success(t("xp_has_been_disabled")))
            }
        }

        else if (isEnabled) {
            const filter = (i: ButtonInteraction) => {
                i.deferUpdate()
                return i.user.id === interaction.user.id && i.customId === "confirmed" || i.customId === "cancelled"
            }

            const actionRow = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId("confirmed")
                        .setLabel(t("confirm"))
                        .setStyle(ButtonStyle.Danger),
                    new ButtonBuilder()
                        .setCustomId("cancelled")
                        .setLabel(t("cancel"))
                        .setStyle(ButtonStyle.Secondary)
                )

            if (subcommandGroup === "reset") {
                if (member && !member.permissions.has(PermissionFlagsBits.Administrator)) return interaction.reply({ content: denied(t("not_allowed_to_reset_xp")), ephemeral: true })
                if (!interaction.guild.members.me?.permissions.has(PermissionFlagsBits.AddReactions)) return interaction.reply({ content: error(t("cannot_react_to_messages")), ephemeral: true })

                if (subcommand === "all") {
                    await interaction.reply({ content: what(t("server_xp_reset_validation")), components: [actionRow] })
                    const validationMessage = await interaction.fetchReply() as Message

                    const collector = validationMessage.createMessageComponentCollector({ filter, componentType: ComponentType.Button, time: 30_000 })

                    collector.on("collect", i => {
                        if (i.customId === "confirmed") {
                            const profiles = bot.db.prepare("SELECT * FROM xp_profiles WHERE guild_id = ?").all(interaction.guild?.id) as XpProfile[]

                            for (const profile of profiles) {
                                bot.db.prepare("INSERT INTO xp_profiles(guild_id, user_id, xp, total_xp, level) VALUES(?,?,?,?,?) ON CONFLICT(guild_id, user_id) DO UPDATE SET xp=excluded.xp, total_xp=excluded.total_xp, level=excluded.level").run(profile.guild_id, profile.user_id, 0, 0, 0)
                                bot.db.prepare("DELETE FROM xp_profiles WHERE guild_id = ? AND color IS NULL AND background IS NULL").run(profile.guild_id)
                            }

                            interaction.editReply({ content: success(t("server_xp_successfully_reset")), components: [] })
                        }
                        else {
                            interaction.editReply({ content: success(t("server_xp_cancelled")), components: [] })
                        }
                    })
                }
                else {
                    const user = interaction.options.getUser("user") ?? interaction.user

                    if (user.bot) return interaction.reply({ content: error(t("bots_not_allowed")), ephemeral: true })

                    const isInXpTable = bot.db.prepare("SELECT * FROM xp_profiles WHERE guild_id = ? AND user_id = ?").get(interaction.guild.id, user.id)

                    if (!isInXpTable) return interaction.reply({ content: t("member_zero_xp"), ephemeral: true })

                    if (user.id === interaction.user.id) await interaction.reply({ content: what(t("your_xp_reset_validation")), components: [actionRow] })
                    else await interaction.reply({ content: what(`${t("are_you_sure_you_want_to_reset", { username: user.username })}`), components: [actionRow] })

                    const validationMessage = await interaction.fetchReply() as Message
                    const collector = validationMessage.createMessageComponentCollector({ filter, componentType: ComponentType.Button, time: 30_000 })

                    collector.on("collect", i => {
                        if (i.customId === "confirmed") {
                            bot.db.prepare("INSERT INTO xp_profiles(guild_id, user_id, xp, total_xp, level) VALUES(?,?,?,?,?) ON CONFLICT(guild_id, user_id) DO UPDATE SET xp = excluded.xp, total_xp = excluded.total_xp, level = excluded.level").run(interaction.guild?.id, user.id, 0, 0, 0)

                            if (user.id === interaction.user.id) interaction.editReply({ content: success(t("your_xp_successfully_reset")), components: [] })
                            else interaction.editReply({ content: success(`${t("xp_reset_of")}${user.username}${t("successfully_reset")}`), components: [] })
                        }
                        else {
                            interaction.editReply({ content: `${t("xp_reset_of")}${user.username}${t("cancelled")}`, components: [] })
                        }
                    })
                }
            }

            else if (subcommandGroup === "message") {
                if (member && !member.permissions.has(PermissionFlagsBits.Administrator)) return interaction.reply({ content: denied(t("not_allowed_to_change_lvl_up_msg")), ephemeral: true })

                const newMsg = subcommand === "reset" ? null : interaction.options.getString("message")
                bot.db.prepare("INSERT INTO xp_guilds(guild_id, is_enabled, level_up_message) VALUES(?,?,?) ON CONFLICT(guild_id) DO UPDATE SET level_up_message=excluded.level_up_message").run(interaction.guild.id, 1, newMsg)

                if (subcommand === "reset") interaction.reply(success(t("lvl_up_msg_reset")))
                else interaction.reply(success(t("lvl_up_msg_updated")))
            }

            else if (subcommandGroup === "channel") {
                if (subcommand === "get") {
                    const channelId = (bot.db.prepare("SELECT level_up_channel_id FROM xp_guilds WHERE guild_id = ?").get(interaction.guild.id) as XpGuild | null)?.level_up_channel_id

                    if (!channelId) interaction.reply(success(t("no_level_up_channel")))
                    else {
                        const channel = await interaction.guild.channels.fetch(channelId)
                        if (!channel) {
                            bot.db.prepare("INSERT INTO xp_guilds(guild_id, is_enabled, level_up_channel_id) VALUES(?,?,?) ON CONFLICT(guild_id) DO UPDATE SET level_up_channel_id=excluded.level_up_channel_id").run(interaction.guild.id, 1, null)

                            interaction.reply(success(t("no_level_up_channel")))
                        }
                        else {
                            interaction.reply(success(`${t("level_up_channel_is")} <#${channel.id}>.`))
                        }
                    }
                }
                else {
                    if (member && !member.permissions.has(PermissionFlagsBits.Administrator)) return interaction.reply({ content: denied(t("not_allowed_to_change_channel")), ephemeral: true })

                    const channel = subcommand === "reset" ? null : interaction.options.getChannel("channel")

                    // TODO fix the comparison if it's a bug (test it, this code is weird)
                    if (subcommand === "set" && channel?.type === ChannelType.GuildText) return interaction.reply({ content: error(t("not_a_text_channel")), ephemeral: true })

                    bot.db.prepare("INSERT INTO xp_guilds(guild_id, is_enabled, level_up_channel_id) VALUES(?,?,?) ON CONFLICT(guild_id) DO UPDATE SET level_up_channel_id=excluded.level_up_channel_id").run(interaction.guild.id, 1, channel ? channel.id : null)

                    if (channel !== null) interaction.reply(success(`${t("the_channel")} <#${channel.id}> ${t("has_been_set_as_level_up_channel")}`))
                    else interaction.reply(success(t("level_up_channel_reset")))
                }
            }

            else if (subcommand === "import") {
                if (member && !member.permissions.has(PermissionFlagsBits.Administrator)) return interaction.reply({ content: denied(t("not_allowed_to_import")), ephemeral: true })

                await interaction.reply({ content: what(t("xp_import_verification")), components: [actionRow] })
                const validationMessage = await interaction.fetchReply() as Message

                const i = await validationMessage.awaitMessageComponent({ filter, componentType: ComponentType.Button, time: 30_000 })

                if (i.customId === "confirmed") {
                    await interaction.editReply({ content: t("starting_import"), components: [] })

                    const players = []
                    let pagePlayers = []

                    let index = 0
                    do {
                        const res = await fetch(`https://mee6.xyz/api/plugins/levels/leaderboard/${interaction.guild.id}?limit=1000&page=${index}`)
                        const data = await res.json()

                        if (!res.ok) return interaction.editReply(t("guild_not_found_on_mee6_api"))

                        pagePlayers = data.players
                        players.push(...pagePlayers)

                        index++
                    } while (pagePlayers.length > 0)

                    if (players.length === 0) return interaction.editReply(t("zero_xp_found_on_mee6_api"))

                    const oldPlayersRow = bot.db.prepare("SELECT user_id, color, background FROM xp_profiles WHERE guild_id = ?").all(interaction.guild.id) as XpProfile[]
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
                    interaction.editReply(success(t("mee6_levels_successfully_imported")))
                }
                else {
                    interaction.editReply({ content: success(t("import_cancelled")), components: [] })
                }
            }

            else if (subcommandGroup === "color") {
                const xpRow = bot.db.prepare("SELECT xp, total_xp, level FROM xp_profiles WHERE guild_id = ? AND user_id = ?").get(interaction.guild.id, interaction.user.id) as XpProfile | null

                const updateColorRequest = bot.db.prepare("INSERT INTO xp_profiles(guild_id, user_id, xp, total_xp, level, color) VALUES(?,?,?,?,?,?) ON CONFLICT(guild_id,user_id) DO UPDATE SET color=excluded.color")

                if (subcommand === "reset") {
                    if (xpRow) {
                        updateColorRequest.run(interaction.guild.id, interaction.user.id, xpRow.xp, xpRow.total_xp, xpRow.level, null)
                    }
                    interaction.reply(success(t("color_reset")))
                }
                else {
                    let color = interaction.options.getString("color") as string
                    if (!color.startsWith("#")) color = `#${color}`

                    const colorRegex = /^#[0-9A-F]{6}$/i
                    if (!colorRegex.test(color)) return interaction.reply({ content: error(t("invalid_color")), ephemeral: true })

                    if (!xpRow) {
                        updateColorRequest.run(interaction.guild.id, interaction.user.id, 0, 0, 0, color)
                    }
                    else {
                        updateColorRequest.run(interaction.guild.id, interaction.user.id, xpRow.xp, xpRow.total_xp, xpRow.level, color)
                    }
                    interaction.reply(success(t("color_updated")))
                }
            }

            else if (subcommandGroup === "background") {
                if (subcommand === "reset") {
                    updateBackground(bot.db, undefined, interaction.user.id, interaction.guild.id)
                    return interaction.reply(success(t("background_reset")))
                }
                else {
                    const link = interaction.options.getString("link") as string

                    try {
                        await Canvas.loadImage(link)
                    }
                    catch {
                        return interaction.reply({ content: error(t("bad_image")), ephemeral: true })
                    }

                    updateBackground(bot.db, link, interaction.user.id, interaction.guild.id)
                    interaction.reply(success(t("background_set")))
                }
            }

            else if (subcommand === "get") {
                if (!interaction.guild.members.me?.permissions.has(PermissionFlagsBits.AttachFiles)) return interaction.reply({ content: error(t("need_send_files")), ephemeral: true })

                const user = interaction.options.getUser("user") ?? interaction.user
                if (user.bot) return interaction.reply({ content: denied(t("bots_not_allowed")), ephemeral: true })

                await interaction.deferReply()

                let xpRow = bot.db.prepare("SELECT xp, level, color FROM xp_profiles WHERE guild_id = ? AND user_id = ?").get(interaction.guild.id, user.id) as { xp: number, level: number, color: string | undefined } | null

                if (!xpRow) {
                    xpRow = {
                        xp: 0,
                        level: 0,
                        color: undefined
                    }
                }

                const { level, xp } = xpRow
                let { color } = xpRow

                if (!color) color = "#1FE7F0"

                const nextLvlXp = 5 * (level * level) + 50 * level + 100
                const percent = xp / nextLvlXp * 100

                const serverRankingRows = (bot.db.prepare("SELECT user_id FROM xp_profiles WHERE guild_id = ? ORDER BY level DESC, xp DESC").all(interaction.guild.id) as XpProfile[]).map(row => row.user_id).filter(async user_id => {
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

                const backgroundUrl = (bot.db.prepare("SELECT background FROM xp_profiles WHERE guild_id = ? AND user_id = ?").get(interaction.guild.id, user.id) as XpProfile | null)?.background

                if (backgroundUrl !== null && backgroundUrl !== undefined) {
                    try {
                        const background = await Canvas.loadImage(backgroundUrl)
                        // @ts-ignore
                        ctx.drawImage(background, 0, 0, canvas.width, canvas.height)
                    }
                    catch {
                        updateBackground(bot.db, undefined, interaction.user.id, interaction.guild.id)

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

                let username = user.displayName

                ctx.font = "25px ubuntu"
                const spaceMeasure = ctx.measureText(" ")

                ctx.font = "40px ubuntu"
                ctx.fillStyle = "#FFFFFF"
                ctx.strokeStyle = "black"
                let usernameMeasure = ctx.measureText(username)

                let tooLongText = ""
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
                }

                ctx.font = "40px ubuntu"
                ctx.fillText(username, 270, 176)
                ctx.strokeText(username, 270, 176)
                ctx.font = "30px ubuntu"
                ctx.fillText(tooLongText, 270 + usernameMeasure.width, 176)
                ctx.strokeText(tooLongText, 270 + usernameMeasure.width, 176)
                ctx.font = "21px ubuntu"
                ctx.fillStyle = "#AAAAAA"

                ctx.fillStyle = color // level
                ctx.font = "70px ubuntu"
                const levelMeasure = ctx.measureText(level.toString())
                const offsetLevel = canvas.width - levelMeasure.width - 40
                ctx.fillText(level.toString(), offsetLevel, 85)
                ctx.strokeText(level.toString(), offsetLevel, 85)

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

                    const nextLvlXpStr = nextLvlXp < 1000 ? nextLvlXp.toString() : (nextLvlXp / 1000).toPrecision(3) + "K"
                    const nextLvlXpMeasure = ctx.measureText(`/ ${nextLvlXpStr} XP`)
                    const offsetNextLvlXpMeasure = canvas.width - nextLvlXpMeasure.width - 50
                    ctx.fillText(`/ ${nextLvlXpStr} XP`, offsetNextLvlXpMeasure, 176)
                    ctx.strokeText(`/ ${nextLvlXpStr} XP`, offsetNextLvlXpMeasure, 176)

                    ctx.fillStyle = "#FFFFFF" // current xp
                    const xpStr = xp < 1000 ? xp.toString() : (xp / 1000).toPrecision(3) + "K"
                    const xpMeasure = ctx.measureText(xpStr)
                    const offsetXp = offsetNextLvlXpMeasure - xpMeasure.width - spaceMeasure.width
                    ctx.fillText(xpStr, offsetXp, 176)
                    ctx.strokeText(xpStr, offsetXp, 176)

                    ctx.save()

                    const progressBarWidth = 620
                    const progressBarHeight = 40

                    ctx.fillStyle = "#555555" // progress bar background
                    ctx.beginPath()
                    roundedRectangle(ctx, 270, 200, progressBarWidth, progressBarHeight, 20)
                    ctx.fill()
                    ctx.stroke()
                    ctx.clip()

                    ctx.fillStyle = color // progress bar foreground
                    ctx.beginPath()
                    const offsetXpBar = percent / 100 * progressBarWidth
                    roundedRectangle(ctx, 270, 200, offsetXpBar, progressBarHeight, 20)
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

                const avatar = await Canvas.loadImage(user.displayAvatarURL({ extension: "png" }))
                // @ts-ignore
                ctx.drawImage(avatar, 40, 40, 200, 200)

                const card = new AttachmentBuilder(canvas.toBuffer(), { name: "card.png" })

                interaction.editReply({ files: [card] })
            }
        }
        else interaction.reply({ content: error(t("xp_disabled")), ephemeral: true })
    }
}

function roundedRectangle(canvas: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, rounded: number) {
    const halfRadians = (2 * Math.PI) / 2
    const quarterRadians = (2 * Math.PI) / 4
    canvas.arc(rounded + x, rounded + y, rounded, -quarterRadians, halfRadians, true)
    canvas.lineTo(x, y + height - rounded)
    canvas.arc(rounded + x, height - rounded + y, rounded, halfRadians, quarterRadians, true)
    canvas.lineTo(x + width - rounded, y + height)
    canvas.arc(x + width - rounded, y + height - rounded, rounded, quarterRadians, 0, true)
    canvas.lineTo(x + width, y + rounded)
    canvas.arc(x + width - rounded, y + rounded, rounded, 0, -quarterRadians, true)
    canvas.lineTo(x + rounded, y)
}

function updateBackground(db: Database, backgroundLink: string | undefined, user_id: string, guild_id: string) {
    let userRow = db.prepare("SELECT xp, total_xp, level FROM xp_profiles WHERE guild_id = ? AND user_id = ?").get(guild_id, user_id) as XpProfile | null

    if (!userRow) {
        userRow = {
            guild_id: guild_id,
            user_id: user_id,
            color: undefined,
            background: backgroundLink,
            xp: 0,
            total_xp: 0,
            level: 0
        }
    }

    db.prepare("INSERT INTO xp_profiles(guild_id, user_id, xp, total_xp, level, background) VALUES(?,?,?,?,?,?) ON CONFLICT(guild_id, user_id) DO UPDATE SET background=excluded.background").run(guild_id, user_id, userRow.xp, userRow.total_xp, userRow.level, backgroundLink)
}