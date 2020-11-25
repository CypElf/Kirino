module.exports = {
	name: "presence",
    description: "description_presence",
    usage: "usage_presence",
    guildOnly: true,
	args: true,
    category: "utility",
    aliases: ["call"],
    permissions: ["manage_channels", "manage_guild or manage_messages"],
	
	async execute(bot, msg, args) {
        if (!msg.member.hasPermission("MANAGE_CHANNELS") && !msg.member.hasPermission("MANAGE_GUILD") && !msg.member.hasPermission("MANAGE_MESSAGES") && (mode !== "channel" || args[1] !== undefined)) return msg.channel.send(`${__("not_enough_permissions_to_use_presence")} ${__("kirino_pff")}`)

        const mode = args[0].toLowerCase()

        if (mode == "channel") {
            if (args[1] === undefined) { // no argument, the user wants to see what channel is set
                const row = bot.db.prepare("SELECT channel_id, dm, current FROM presences WHERE guild_id = ?").get(msg.guild.id)
                if (row === undefined) msg.channel.send(`${__("presence_channel_not_set")} ${__("kirino_what")}`)
                else {
                    if (row.dm) msg.channel.send(`${__("presence_channel_is_set_to_dm")} ${__("kirino_glad")}`)
                    else if (row.current) msg.channel.send(`${__("presence_channel_is_set_to_current")} ${__("kirino_glad")}`)
                    else {
                        const channels = msg.guild.channels.cache.array().filter(channel => channel.id === row.channel_id)
                        if (channels.length > 0) msg.channel.send(`${__("presence_channel_is_set_to_channel")} <#${row.channel_id}>. ${__("kirino_glad")}`)
                        else {
                            bot.db.prepare("DELETE FROM presences WHERE guild_id = ?").run(msg.guild.id)
                            msg.channel.send(`${__("presence_channel_outdated")} ${__("kirino_pout")}`)
                        }
                    }
                }
            }

            else { // argument is set, the user wants to change the channel
                mode_arg = args[1].toLowerCase()

                const presenceRequest = bot.db.prepare("INSERT INTO presences(guild_id,channel_id,locked,dm,current) VALUES(?,?,?,?,?) ON CONFLICT(guild_id) DO UPDATE SET channel_id=excluded.channel_id, dm=excluded.dm, current=excluded.current") 
    
                if (mode_arg === "reset") {
                    const resetRequest = bot.db.prepare("DELETE FROM presences WHERE guild_id = ?")
                    resetRequest.run(msg.guild.id)
                    msg.channel.send(`${__("presence_channel_reset")} ${__("kirino_glad")}`)
                }
                else if (mode_arg === "current") {
                    presenceRequest.run(msg.guild.id, null, 0, 0, 1)
                    msg.channel.send(`${__("i_will_send_it_in_current")} ${__("kirino_glad")}`)
                }
                else if (mode_arg === "dm") {
                    presenceRequest.run(msg.guild.id, null, 0, 1, 0)
                    msg.channel.send(`${__("presence_channel_set_to_dm")} ${__("kirino_glad")}`)
                }
                else {
                    let channel_id
                    if (mode_arg === "here") channel_id = msg.channel.id
                    else {
                        const getChannel = require("../lib/get_channel")
                        const channel = await getChannel(msg, args.slice(1))
                        if (channel === undefined) return msg.channel.send(`${__("bad_channel")} ${__("kirino_pout")}`)
                        channel_id = channel.id
                    }
    
                    presenceRequest.run(msg.guild.id, channel_id, 0, 0, 0)
                    msg.channel.send(`${__("presence_channel_set")} <#${channel_id}>. ${__("kirino_glad")}`)
                }
            }            
        }

        else {
            let duration = args[0]
            if (duration === undefined || isNaN(duration)) return msg.channel.send(`${__("bad_duration")} ${__("kirino_pout")}`)
            duration = Math.round((parseFloat(duration) + Number.EPSILON) * 100) / 100
            if (duration <= 0 || duration > 30) return msg.channel.send(`${__("duration_out_of_range")} ${__("kirino_pout")}`)

            const presenceRequest = bot.db.prepare("SELECT channel_id, locked, dm, current FROM presences WHERE guild_id = ?")
            const row = presenceRequest.get(msg.guild.id)

            if (row !== undefined) {
                if (row.locked >= 3) return msg.channel.send(`${__("records_still_going_on")} ${__("kirino_pout")}`)

                let channel
                const channels = msg.guild.channels.cache.array().filter(channel => channel.id === row.channel_id)

                if (channels.length > 0 || row.dm || row.current) {
                    const lockRequest = bot.db.prepare("UPDATE presences SET locked = locked + ? WHERE guild_id = ?")
                    lockRequest.run(1, msg.guild.id)

                    if (row.dm) {
                        channel = msg.author.dmChannel
                        if (!channel) channel = await msg.author.createDM()
                    }
                    else if (row.current) channel = msg.channel
                    else channel = channels[0]

                    msg.delete().catch(() => {})
                    const recordMsg = await msg.channel.send(`**${__("record_started")}** ${__("kirino_glad")}\n${__("you_have")} ${duration} ${__("min_to_raise_the_hand")} 🙋.`)
                    recordMsg.react("🙋")

                    const filter = reaction => reaction.emoji.name === '🙋'

                    try {
                        const languageBak = getLocale()
                        const collected = await recordMsg.awaitReactions(filter, { time: 1000 * 60 * duration })
                        
                        for (const reaction of collected.array()) {
                            let presents = await reaction.users.fetch()
                            presents = presents.array().filter(user => !user.bot)

                            let members = []
                            for (const user of presents) {
                                const member = await msg.guild.members.fetch(user)
                                if (member !== null) members.push(member)
                            }

                            members = members.map(member => {
                                txt = `- ${member.user.tag}`
                                if (member.nickname) txt += ` (${member.nickname})`
                                return txt
                            })

                            const setLanguage = require("../lib/set_language")
                            setLanguage(bot, msg)

                            msg.channel.send(`**${__("record_ended")}** ${__("kirino_glad")}`)
                            txt = [`**${__("record_from")} ${msg.author.username}${__("s_call")}** :\n`]
                            if (members.length === 0) txt[0] += __("nobody")
                            let i = 0
                            for (const record of members) {
                                if (txt[i].length + record.length <= 2000) txt[i] += record + "\n"
                                else {
                                    i++
                                    txt.push("")
                                }
                            }

                            for (const chunk of txt) {
                                try {
                                    await channel.send(chunk)
                                }
                                catch {
                                    channel = msg.channel

                                    if (row.dm) msg.channel.send(`${__("presence_dm_disabled")} ${__("kirino_what")}`)
                                    else msg.channel.send(`${__("presence_channel_deleted_during_call")} ${__("kirino_what")}`)
                                    channel.send(__("so_i_will_send_it_here"))

                                    await channel.send(chunk)
                                }
                            }
                            setLocale(languageBak)
                            lockRequest.run(-1, msg.guild.id)
                        }
                    }
                    catch {}
                }
                else {
                    msg.channel.send(`${__("presence_channel_not_found")} ${__("kirino_what")}`)
                    bot.db.prepare("DELETE FROM presences WHERE guild_id = ?").run(msg.guild.id)
                }
                
            }
            else msg.channel.send(`${__("no_presence_channel_set")} ${__("kirino_pout")}`)
        }
	}
}