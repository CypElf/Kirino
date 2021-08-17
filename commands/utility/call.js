module.exports = {
    name: "call",
    guildOnly: true,
    args: true,
    aliases: ["presence"],
    permissions: ["manage_channels", "manage_guild or manage_messages"],

    async execute(bot, msg, args) {
        const { MessageAttachment, Permissions } = require("discord.js")
        const formatDate = require("../../lib/misc/format_date")
        const mode = args[0].toLowerCase()

        if (!msg.member.permissions.has(Permissions.FLAGS.MANAGE_CHANNELS) && !msg.member.permissions.has(Permissions.FLAGS.MANAGE_GUILD) && !msg.member.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES) && (mode !== "channel" || args[1] !== undefined)) return msg.channel.send(`${__("not_enough_permissions_to_use_presence")} ${__("kirino_pff")}`)

        if (mode === "asfile") {
            const asfileRequest = bot.db.prepare("INSERT INTO calls VALUES(?,?,?,?) ON CONFLICT(guild_id) DO UPDATE SET asfile = excluded.asfile")
            const mode_arg = args[1]?.toLowerCase()

            if (mode_arg === undefined) {
                const { asfile } = bot.db.prepare("SELECT asfile FROM calls WHERE guild_id = ?").get(msg.guild.id) ?? { asfile: 0 }
                msg.channel.send(`${__("currently_results_sent")} ${asfile === 0 ? __("as_message") : __("as_file")} ${__("kirino_glad")}`)
            }

            else {
                if (mode_arg !== "on" && mode_arg !== "off") return msg.channel.send(`${__("bad_call_asfile_option")} ${__("kirino_pout")}`)

                const state = mode_arg === "on" ? 1 : 0
                asfileRequest.run(msg.guild.id, null, 0, state)

                deleteRowIfEmpty(bot.db, msg.guild.id)

                msg.channel.send(state === 1 ? __("asfile_success_on") : __("asfile_success_off"))
            }
        }

        else if (mode == "channel") {
            if (args[1] === undefined) { // no argument, the user wants to see what channel is set
                const row = bot.db.prepare("SELECT channel_id, dm FROM calls WHERE guild_id = ?").get(msg.guild.id) ?? { channel_id: null, dm: 0, asfile: 0 }
                const current = row.channel_id === null && row.dm === 0
                
                if (row.dm) msg.channel.send(`${__("presence_channel_is_set_to_dm")} ${__("kirino_glad")}`)
                else if (current) msg.channel.send(`${__("presence_channel_is_set_to_current")} ${__("kirino_glad")}`)
                else {
                    const channels = [...msg.guild.channels.cache.values()].filter(channel => channel.id === row.channel_id)
                    if (channels.length > 0) msg.channel.send(`${__("presence_channel_is_set_to_channel")} <#${row.channel_id}>. ${__("kirino_glad")}`)
                    else {
                        bot.db.prepare("UPDATE calls SET channel_id = ? WHERE guild_id = ?").run(null, msg.guild.id)
                        deleteRowIfEmpty(bot.db, msg.guild.id)
                        msg.channel.send(`${__("presence_channel_outdated")} ${__("kirino_pout")}`)
                    }
                }
            }

            else { // argument is set, the user wants to change the channel
                mode_arg = args[1].toLowerCase()

                const presenceRequest = bot.db.prepare("INSERT INTO calls VALUES(?,?,?,?) ON CONFLICT(guild_id) DO UPDATE SET channel_id = excluded.channel_id, dm = excluded.dm, asfile = excluded.asfile")

                const { asfile } = bot.db.prepare("SELECT * FROM calls WHERE guild_id = ?").get(msg.guild.id) ?? { asfile: 0 }

                if (mode_arg === "reset") {
                    presenceRequest.run(msg.guild.id, null, 0, asfile)
                    msg.channel.send(`${__("i_will_send_it_in_current")} ${__("kirino_glad")}`)
                }
                else if (mode_arg === "dm") {
                    presenceRequest.run(msg.guild.id, null, 1, asfile)
                    msg.channel.send(`${__("presence_channel_set_to_dm")} ${__("kirino_glad")}`)
                }
                else {
                    let channel_id
                    if (mode_arg === "here") channel_id = msg.channel.id
                    else {
                        const getChannel = require("../../lib/getters/get_channel")
                        const channel = await getChannel(msg, args.slice(1))
                        if (channel === undefined) return msg.channel.send(`${__("bad_channel")} ${__("kirino_pout")}`)
                        channel_id = channel.id
                    }

                    presenceRequest.run(msg.guild.id, channel_id, 0, asfile)
                    msg.channel.send(`${__("presence_channel_set")} <#${channel_id}>. ${__("kirino_glad")}`)
                }
            }
        }

        else {
            let duration = args[0]
            if (duration === undefined || isNaN(duration)) return msg.channel.send(`${__("bad_duration")} ${__("kirino_pout")}`)
            duration = Math.round((parseFloat(duration) + Number.EPSILON) * 100) / 100
            if (duration <= 0 || duration > 30) return msg.channel.send(`${__("duration_out_of_range")} ${__("kirino_pout")}`)

            const row = bot.db.prepare("SELECT channel_id, dm FROM calls WHERE guild_id = ?").get(msg.guild.id) ?? { channel_id: null, dm: 0, asfile: 0 }
            const current = row.channel_id === null && row.dm === 0

            const locked = bot.calls.get(msg.guild.id) ?? 0

            if (locked >= 3) return msg.channel.send(`${__("records_still_going_on")} ${__("kirino_pout")}`)

            let channel
            const channels = [...msg.guild.channels.cache.values()].filter(ch => ch.id === row.channel_id)

            if (channels.length > 0 || row.dm || current) {
                bot.calls.set(msg.guild.id, locked + 1)

                if (row.dm) {
                    channel = msg.author.dmChannel
                    if (!channel) channel = await msg.author.createDM()
                }
                else if (current) channel = msg.channel
                else channel = channels[0]

                msg.delete().catch()
                const recordMsg = await msg.channel.send(`**${__("record_started")}** ${__("kirino_glad")}\n${__("you_have")} ${duration} ${__("min_to_raise_the_hand")} 🙋.`)
                recordMsg.react("🙋")

                const filter = reaction => reaction.emoji.name === "🙋"

                const languageBak = getLocale()
                const collected = await recordMsg.awaitReactions({ filter, time: 1000 * 60 * duration })

                for (const reaction of [...collected.values()]) {
                    let presents = await reaction.users.fetch()
                    presents = [...presents.values()].filter(user => !user.bot)

                    let members = []
                    for (const user of presents) {
                        const member = await msg.guild.members.fetch(user)
                        if (member !== null) members.push(member)
                    }

                    members = members.map(member => {
                        let txt = `- ${member.user.username}`
                        if (member.nickname) txt += ` (${member.nickname})`
                        return txt
                    })

                    const setLanguage = require("../../lib/language/set_language")
                    setLanguage(bot.db, msg.guild ? msg.guild.id : msg.author.id)

                    msg.channel.send(`**${__("record_ended")}** ${__("kirino_glad")}`)

                    const txt = [`${row.asfile ? "" : "**"}${__("record_from")} ${msg.author.username}${__("s_call")}${row.asfile ? "" : "**"} ${row.asfile ? `(${formatDate(new Date())})` : ""} :\n`]
                    if (members.length === 0) txt[0] += __("nobody")

                    if (row.asfile) txt[0] += members.join("\n")
                    else {
                        let i = 0
                        for (const record of members) {
                            if (txt[i].length + record.length <= 2000) txt[i] += record + "\n"
                            else {
                                i++
                                txt.push("")
                            }
                        }
                    }

                    for (const chunk of txt) {
                        const isFile = row.asfile
                        const content = isFile ? new MessageAttachment(Buffer.from(chunk, "utf-8"), "record.txt") : chunk

                        try {
                            if (isFile) await channel.send({ files: [content] })
                            else await channel.send(content)
                        }
                        catch {
                            channel = msg.channel

                            if (row.dm) msg.channel.send(`${__("presence_dm_disabled")} ${__("kirino_what")}`)
                            else {
                                msg.channel.send(`${__("presence_channel_deleted_during_call")} ${__("kirino_what")}`)
                                bot.db.prepare("UPDATE calls SET channel_id = ? WHERE guild_id = ?").run(null, msg.guild.id) // if the channel has been deleted during the call, it cannot be valid anymore in the future
                            }
                            channel.send(__("so_i_will_send_it_here"))

                            if (isFile) channel.send({ files: [content] })
                            else channel.send(content)
                        }
                    }

                    setLocale(languageBak)
                    bot.calls.set(msg.guild.id, bot.calls.get(msg.guild.id) - 1)
                }
            }
            else {
                bot.db.prepare("UPDATE calls SET channel_id = ? WHERE guild_id = ?").run(null, msg.guild.id)
                deleteRowIfEmpty(bot.db, msg.guild.id)
                msg.channel.send(`${__("presence_channel_not_found")} ${__("kirino_what")}`)
            }
        }
    }
}

function deleteRowIfEmpty(db, guild_id) {
    const { channel_id, dm, asfile } = db.prepare("SELECT * FROM calls WHERE guild_id = ?").get(guild_id)
    if (channel_id === null && dm === 0 && asfile === 0) db.prepare("DELETE FROM calls WHERE guild_id = ?").run(guild_id)
}