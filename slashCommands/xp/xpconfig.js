const { SlashCommandBuilder } = require("@discordjs/builders")
const { Permissions } = require("discord.js")
const Canvas = require("canvas")
const fetch = require("node-fetch")
const updateBackground = require("../../lib/misc/update_background")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("xpconfig")
        .setDescription("Allow to config the XP system and customize some of its elements")

        .addSubcommandGroup(option => option.setName("color").setDescription("Allow you to change or reset the color of your XP card").addSubcommand(option => option.setName("set").setDescription("Allow you to change the color of your XP card").addStringOption(option => option.setName("color").setDescription("The hexadecimal color code of the color you want").setRequired(true))).addSubcommand(option => option.setName("reset").setDescription("Reset the color of your XP card to the default")))

        .addSubcommandGroup(option => option.setName("background").setDescription("Allow you to change or remove the custom background of your XP card").addSubcommand(option => option.setName("set").setDescription("Allow you to change the custom background of your XP card").addStringOption(option => option.setName("link").setDescription("A link to the image to set as the new custom background").setRequired(true))).addSubcommand(option => option.setName("reset").setDescription("Remove the custom background from your XP card")))

        .addSubcommandGroup(option => option.setName("channel").setDescription("Allow you to change or remove the fixed channel for level up messages").addSubcommand(option => option.setName("get").setDescription("Allow you to know in what channel are currently sent the level up messages")).addSubcommand(option => option.setName("set").setDescription("Allow you to change the fixed channel for level up messages").addChannelOption(option => option.setName("channel").setDescription("The new channel for the level up messages").setRequired(true))).addSubcommand(option => option.setName("reset").setDescription("Remove the fixed channel for level up messages and restore the default behavior")))

        .addSubcommandGroup(option => option.setName("reset").setDescription("Allow you to reset the level of a member or the whole server").addSubcommand(option => option.setName("user").setDescription("Reset the level of a member in the server").addUserOption(option => option.setName("user").setDescription("The user you want to reset the level. If not specified, default is yourself"))).addSubcommand(option => option.setName("all").setDescription("Reset all the levels in the server")))

        .addSubcommandGroup(option => option.setName("message").setDescription("Allow you to change or reset to the default the level up message").addSubcommand(option => option.setName("set").setDescription("Change the level up message").addStringOption(option => option.setName("message").setDescription("The new level up message").setRequired(true))).addSubcommand(option => option.setName("reset").setDescription("Reset the level up message to the default")))

        .addSubcommand(option => option.setName("enable").setDescription("Enable the XP system"))
        .addSubcommand(option => option.setName("disable").setDescription("Disable the XP system"))
        .addSubcommand(option => option.setName("import").setDescription("Import the level from MEE6's XP system")),

    guildOnly: true,
    cooldown: 3,
    permissions: ["{administrator}"],

    async execute(bot, interaction) {

        const isEnabled = bot.db.prepare("SELECT is_enabled FROM xp_guilds WHERE guild_id = ?").get(interaction.guild.id)?.is_enabled

        const subcommand = interaction.options.getSubcommand()
        const subcommandGroup = interaction.options.getSubcommandGroup(false)

        if (subcommand === "enable" || subcommand === "disable") {
            if (!interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) return interaction.reply({ content: `${__("not_allowed_to_enable_or_disable")} ${__("kirino_pff")}`, ephemeral: true })
            const enableRequest = bot.db.prepare("INSERT INTO xp_guilds(guild_id,is_enabled) VALUES(?,?) ON CONFLICT(guild_id) DO UPDATE SET is_enabled=excluded.is_enabled")

            if (subcommand === "enable") {
                if (isEnabled) return interaction.reply({ content: `${__("xp_already_enabled")} ${__("kirino_pout")}`, ephemeral: true })
                enableRequest.run(interaction.guild.id, 1)
                interaction.reply(`${__("xp_enabled")} ${__("kirino_glad")}`)
            }

            else {
                if (!isEnabled) return interaction.reply({ content: `${__("xp_already_disabled")} ${__("kirino_pout")}`, ephemeral: true })
                enableRequest.run(interaction.guild.id, 0)
                interaction.reply(`${__("xp_disabled")} ${__("kirino_glad")}`)
            }
        }

        else if (isEnabled) {
            const filter = (reaction, user) => {
                return reaction.emoji.name === "✅" && user.id === interaction.user.id || reaction.emoji.name === "❌" && user.id === interaction.user.id
            }

            if (subcommandGroup === "reset") {
                if (!interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) return interaction.reply({ content: `${__("not_allowed_to_reset_xp")} ${__("kirino_pff")}`, ephemeral: true })
                if (!interaction.guild.me.permissions.has(Permissions.FLAGS.ADD_REACTIONS)) return interaction.reply({ content: `${__("cannot_react_to_messages")} ${__("kirino_pout")}`, ephemeral: true })

                if (subcommand === "all") {
                    await interaction.reply(__("server_xp_reset_validation"))
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

                            interaction.followUp(`${__("server_xp_successfully_reset")} ${__("kirino_glad")}`)
                        }
                        else {
                            interaction.followUp(__("server_xp_canceled"))
                        }
                    })
                }
                else {
                    const user = interaction.options.getUser("user") ?? interaction.user

                    if (user.bot) return interaction.reply({ content: `${__("bots_not_allowed")} ${__("kirino_pout")}`, ephemeral: true })

                    const isInXpTable = bot.db.prepare("SELECT * FROM xp_profiles WHERE guild_id = ? AND user_id = ?").get(interaction.guild.id, user.id)

                    if (!isInXpTable) return interaction.reply({ content: __("member_zero_xp"), ephemeral: true })

                    if (user.id === interaction.user.id) await interaction.reply(__("your_xp_reset_validation"))
                    else await interaction.reply(`${__("are_you_sure_you_want_to_reset")} ${user.username}${__("'s_xp")}`)

                    const validationMessage = await interaction.fetchReply()

                    validationMessage.react("✅")
                    validationMessage.react("❌")

                    const collector = validationMessage.createReactionCollector({ filter, max: 1, time: 30_000 })

                    collector.on("collect", (reaction) => {
                        if (reaction.emoji.name === "✅") {
                            bot.db.prepare("INSERT INTO xp_profiles(guild_id, user_id, xp, total_xp, level) VALUES(?,?,?,?,?) ON CONFLICT(guild_id, user_id) DO UPDATE SET xp=excluded.xp, total_xp=excluded.total_xp, level=excluded.level").run(interaction.guild.id, user.id, 0, 0, 0)

                            if (user.id === interaction.user.id) interaction.followUp(`${__("your_xp_successfully_reset")} ${__("kirino_glad")}`)
                            else interaction.followUp(`${__("xp_reset_of")}${user.username}${__("successfully_reset")} ${__("kirino_glad")}`)
                        }
                        else {
                            interaction.followUp(`${__("xp_reset_of")}${user.username}${__("cancelled")}`)
                        }
                    })
                }
            }

            else if (subcommandGroup === "message") {
                if (!interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) return interaction.reply({ content: `${__("not_allowed_to_change_lvl_up_msg")} ${__("kirino_pff")}`, ephemeral: true })

                const newMsg = subcommand === "reset" ? null : interaction.options.getString("message")
                bot.db.prepare("INSERT INTO xp_guilds(guild_id, is_enabled, level_up_message) VALUES(?,?,?) ON CONFLICT(guild_id) DO UPDATE SET level_up_message=excluded.level_up_message").run(interaction.guild.id, 1, newMsg)

                if (subcommand === "reset") interaction.reply(`${__("lvl_up_msg_reset")} ${__("kirino_glad")}`)
                else interaction.reply(`${__("lvl_up_msg_updated")} ${__("kirino_glad")}`)
            }

            else if (subcommandGroup === "channel") {
                if (subcommand === "get") {
                    let channel = bot.db.prepare("SELECT level_up_channel_id FROM xp_guilds WHERE guild_id = ?").get(interaction.guild.id).level_up_channel_id

                    if (channel === null) interaction.reply(`${__("no_level_up_channel")} ${__("kirino_glad")}`)
                    else {
                        channel = await interaction.guild.channels.fetch(channel)
                        if (channel === undefined) {
                            bot.db.prepare("INSERT INTO xp_guilds(guild_id, is_enabled, level_up_channel_id) VALUES(?,?,?) ON CONFLICT(guild_id) DO UPDATE SET level_up_channel_id=excluded.level_up_channel_id").run(interaction.guild.id, 1, null)

                            interaction.reply(`${__("no_level_up_channel")} ${__("kirino_glad")}`)
                        }
                        else {
                            interaction.reply(`${__("level_up_channel_is")} <#${channel.id}>. ${__("kirino_glad")}`)
                        }
                    }
                }
                else {
                    if (!interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) return interaction.reply({ content: `${__("not_allowed_to_change_channel")} ${__("kirino_pff")}`, ephemeral: true })

                    const channel = subcommand === "reset" ? null : interaction.options.getChannel("channel")

                    if (subcommand === "set" && !channel.isText()) return interaction.reply({ content: `${__("not_a_text_channel")} ${__("kirino_pout")}`, ephemeral: true })

                    bot.db.prepare("INSERT INTO xp_guilds(guild_id, is_enabled, level_up_channel_id) VALUES(?,?,?) ON CONFLICT(guild_id) DO UPDATE SET level_up_channel_id=excluded.level_up_channel_id").run(interaction.guild.id, 1, channel ? channel.id : null)

                    if (channel !== null) interaction.reply(`${__("the_channel")} <#${channel.id}> ${__("has_been_set_as_level_up_channel")} ${__("kirino_glad")}`)
                    else interaction.reply(`${__("level_up_channel_reset")} ${__("kirino_glad")}`)
                }
            }

            else if (subcommand === "import") {
                if (!interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) return interaction.reply({ content: `${__("not_allowed_to_import")} ${__("kirino_pff")}`, ephemeral: true })

                await interaction.reply(__("xp_import_verification"))
                const validationMessage = await interaction.fetchReply()

                validationMessage.react("✅")
                validationMessage.react("❌")

                const collector = validationMessage.createReactionCollector({ filter, max: 1, time: 30_000 })

                collector.on("collect", async (reaction) => {
                    if (reaction.emoji.name === "✅") {
                        const importMessage = await interaction.followUp(__("starting_import"))

                        const players = []
                        let pagePlayers = []

                        let i = 0
                        do {
                            const res = await fetch(`https://mee6.xyz/api/plugins/levels/leaderboard/${interaction.guild.id}?limit=1000&page=${i}`)
                            const data = await res.json()

                            if (!res.ok) return importMessage.edit(__("guild_not_found_on_mee6_api"))

                            pagePlayers = data.players
                            players.push(...pagePlayers)

                            i++
                        } while (pagePlayers.length > 0)

                        if (players.length === 0) return importMessage.edit(__("zero_xp_found_on_mee6_api"))

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
                        importMessage.edit(`${__("mee6_levels_successfully_imported")} ${__("kirino_glad")}`)
                    }
                    else {
                        interaction.followUp(__("import_cancelled"))
                    }
                })
            }

            else if (subcommandGroup === "color") {
                const xpRow = bot.db.prepare("SELECT xp, total_xp, level FROM xp_profiles WHERE guild_id = ? AND user_id = ?").get(interaction.guild.id, interaction.user.id)

                const updateColorRequest = bot.db.prepare("INSERT INTO xp_profiles(guild_id, user_id, xp, total_xp, level, color) VALUES(?,?,?,?,?,?) ON CONFLICT(guild_id,user_id) DO UPDATE SET color=excluded.color")

                if (subcommand === "reset") {
                    updateColorRequest.run(interaction.guild.id, interaction.user.id, xpRow.xp, xpRow.total_xp, xpRow.level, null)
                    interaction.reply(`${__("color_reset")} ${__("kirino_glad")}`)
                }
                else {
                    let color = interaction.options.getString("color")
                    if (!color.startsWith("#")) color = `#${color}`

                    const colorRegex = /^#[0-9A-F]{6}$/i
                    if (!colorRegex.test(color)) return interaction.reply({ content: `${__("invalid_color")} ${__("kirino_pout")}`, ephemeral: true })

                    updateColorRequest.run(interaction.guild.id, interaction.user.id, xpRow.xp, xpRow.total_xp, xpRow.level, color)
                    interaction.reply(`${__("color_updated")} ${__("kirino_glad")}`)
                }
            }

            else if (subcommandGroup === "background") {

                if (subcommand === "reset") {
                    updateBackground(bot.db, null, interaction.user.id, interaction.guild.id)
                    return interaction.reply(`${__("background_reset")} ${__("kirino_glad")}`)
                }

                const link = interaction.options.getString("link")

                try {
                    await Canvas.loadImage(link)
                }
                catch {
                    return interaction.reply({ content: `${__("bad_image")} ${__("kirino_pout")}`, ephemeral: true })
                }

                updateBackground(bot.db, link, interaction.user.id, interaction.guild.id)

                interaction.reply(`${__("background_set")} ${__("kirino_glad")}`)
            }
        }
        else interaction.reply({ content: `${__("currently_disabled_enable_with")} \`xpconfig enable\`.`, ephemeral: true })
    }
}