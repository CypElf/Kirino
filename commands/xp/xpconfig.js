const Canvas = require("canvas")

module.exports = {
    name: "xpconfig",
    guildOnly: true,
    args: true,
    permissions: ["{administrator}"],

    async execute(bot, msg, args) {
        const { Permissions } = require("discord.js")
        const getMember = require("../../lib/getters/get_member")

        const isEnabled = bot.db.prepare("SELECT is_enabled FROM xp_guilds WHERE guild_id = ?").get(msg.guild.id)?.is_enabled
        const request = args[0]

        if (request === "enable" || request === "disable") {
            if (!msg.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) return msg.channel.send(`${__("not_allowed_to_enable_or_disable")} ${__("kirino_pff")}`)
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

        else if (isEnabled) {
            const filter = (reaction, user) => {
                return reaction.emoji.name === "✅" && user.id === msg.author.id || reaction.emoji.name === "❌" && user.id === msg.author.id
            }

            if (request === "reset") {
                if (!msg.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) return msg.channel.send(`${__("not_allowed_to_reset_xp")} ${__("kirino_pff")}`)
                if (!msg.guild.me.permissions.has(Permissions.FLAGS.ADD_REACTIONS)) return msg.channel.send(`${__("cannot_react_to_messages")} ${__("kirino_pout")}`)

                args.shift()

                if (args[0] === "all") {
                    const validationMessage = await msg.channel.send(__("server_xp_reset_validation"))

                    validationMessage.react("✅")
                    validationMessage.react("❌")

                    const collector = validationMessage.createReactionCollector({ filter, max: 1, time: 30_000 })

                    collector.on("collect", (reaction) => {
                        if (reaction.emoji.name === "✅") {
                            const profilesRequest = bot.db.prepare("SELECT * FROM xp_profiles WHERE guild_id = ?")
                            const profiles = profilesRequest.all(msg.guild.id)

                            for (const profile of profiles) {
                                bot.db.prepare("INSERT INTO xp_profiles(guild_id, user_id, xp, total_xp, level) VALUES(?,?,?,?,?) ON CONFLICT(guild_id, user_id) DO UPDATE SET xp=excluded.xp, total_xp=excluded.total_xp, level=excluded.level").run(profile.guild_id, profile.user_id, 0, 0, 0)
                                bot.db.prepare("DELETE FROM xp_profiles WHERE guild_id = ? AND color IS NULL AND background IS NULL").run(profile.guild_id)
                            }

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
                    else member = await getMember(msg, args)
                    if (!member) return msg.channel.send(`${__("please_correctly_write_or_mention_a_member")} ${__("kirino_pout")}`)
                    else if (member.user.bot) return msg.channel.send(`${__("bots_not_allowed")} ${__("kirino_pout")}`)

                    const isInXpTableRequest = bot.db.prepare("SELECT * FROM xp_profiles WHERE guild_id = ? AND user_id = ?")
                    const isInXpTable = isInXpTableRequest.get(msg.guild.id, member.id)

                    if (!isInXpTable) return msg.channel.send(__("member_zero_xp"))

                    let validationMessage
                    if (args[0] === undefined) validationMessage = await msg.channel.send(__("your_xp_reset_validation"))
                    else validationMessage = await msg.channel.send(`${__("are_you_sure_you_want_to_reset")} ${member.user.username}${__("'s_xp")}`)

                    validationMessage.react("✅")
                    validationMessage.react("❌")

                    const collector = validationMessage.createReactionCollector({ filter, max: 1, time: 30_000 })

                    collector.on("collect", (reaction) => {
                        if (reaction.emoji.name === "✅") {
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
                if (!msg.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) return msg.channel.send(`${__("not_allowed_to_change_lvl_up_msg")} ${__("kirino_pff")}`)
                args.shift()
                let newMsg = args.join(" ")

                if (newMsg === "reset") newMsg = null
                const msgUpdateRequest = bot.db.prepare("INSERT INTO xp_guilds(guild_id, is_enabled, level_up_message) VALUES(?,?,?) ON CONFLICT(guild_id) DO UPDATE SET level_up_message=excluded.level_up_message")
                msgUpdateRequest.run(msg.guild.id, 1, newMsg)
                if (newMsg === null) msg.channel.send(`${__("lvl_up_msg_reset")} ${__("kirino_glad")}`)
                else msg.channel.send(`${__("lvl_up_msg_updated")} ${__("kirino_glad")}`)
            }

            else if (request === "channel") {
                if (!msg.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) return msg.channel.send(`${__("not_allowed_to_change_channel")} ${__("kirino_pff")}`)

                if (args.slice(1)[0] === undefined) {
                    const getChannelRequest = bot.db.prepare("SELECT level_up_channel_id FROM xp_guilds WHERE guild_id = ?")
                    let channel = getChannelRequest.get(msg.guild.id).level_up_channel_id

                    if (channel === null) msg.channel.send(`${__("no_level_up_channel")} ${__("kirino_glad")}`)
                    else {
                        const getChannel = require("../../lib/getters/get_channel")
                        channel = await getChannel(msg, [channel])
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

                    const getChannel = require("../../lib/getters/get_channel")
                    let channel = await getChannel(msg, args.slice(1))

                    if (args.slice(1)[0] === "reset") channel = null
                    else channel = channel.id

                    if (channel === undefined) return msg.channel.send(`${__("bad_channel")} ${__("kirino_pout")}`)

                    changeChannelRequest.run(msg.guild.id, 1, channel)

                    if (channel !== null) msg.channel.send(`${__("the_channel")} <#${channel}> ${__("has_been_set_as_level_up_channel")} ${__("kirino_glad")}`)
                    else msg.channel.send(`${__("level_up_channel_reset")} ${__("kirino_glad")}`)
                }
            }

            else if (request === "import") {
                if (!msg.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) return msg.channel.send(`${__("not_allowed_to_import")} ${__("kirino_pff")}`)

                validationMessage = await msg.channel.send(__("xp_import_verification"))

                validationMessage.react("✅")
                validationMessage.react("❌")

                const collector = validationMessage.createReactionCollector({ filter, max: 1, time: 30_000 })

                collector.on("collect", async (reaction) => {
                    if (reaction.emoji.name === "✅") {
                        const importMessage = await msg.channel.send(__("starting_import"))

                        const players = []
                        let pagePlayers = []
                        const fetch = require("node-fetch")

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

                        const oldPlayersRow = bot.db.prepare("SELECT user_id, color, background FROM xp_profiles WHERE guild_id = ?").all(msg.guild.id)
                        bot.db.prepare("DELETE FROM xp_profiles WHERE guild_id = ?").run(msg.guild.id)

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

                if (arg === "reset") {
                    updateBackground(bot.db, msg, null)
                    return msg.channel.send(`${__("background_reset")} ${__("kirino_glad")}`)
                }

                let url = arg

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
        }
        else msg.channel.send(`${__("currently_disabled_enable_with")} \`${bot.prefix}xp enable\`.`)
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

function updateBackground(db, msg, background) {
    const userRow = db.prepare("SELECT xp, total_xp, level FROM xp_profiles WHERE guild_id = ? AND user_id = ?").get(msg.guild.id, msg.author.id)
    if (userRow.xp === undefined) userRow.xp = 0
    if (userRow.total_xp === undefined) userRow.total_xp = 0
    if (userRow.level === undefined) userRow.level = 0
    db.prepare("INSERT INTO xp_profiles(guild_id, user_id, xp, total_xp, level, background) VALUES(?,?,?,?,?,?) ON CONFLICT(guild_id, user_id) DO UPDATE SET background=excluded.background").run(msg.guild.id, msg.author.id, userRow.xp, userRow.total_xp, userRow.level, background)
}