module.exports = {
	name: "presence",
    description: "description_presence",
    usage: "usage_presenc",
    guildOnly: true,
	args: true,
    category: "utility",
    aliases: ["call"],
    permissions: ["manage_channels", "manage_guild or manage_messages"],
	
	async execute(bot, msg, args) {
        if (!msg.member.hasPermission("MANAGE_CHANNELS") && !msg.member.hasPermission("MANAGE_GUILD") && !msg.member.hasPermission("MANAGE_MESSAGES")) return msg.channel.send(`${__("not_enough_permissions_to_use_presence")} ${__("kirino_pff")}`)

        const mode = args[0]


        if (mode == "channel") {
            mode_arg = args[1]
            const presenceRequest = bot.db.prepare("INSERT INTO presences(guild_id,channel_id,locked) VALUES(?,?,?) ON CONFLICT(guild_id) DO UPDATE SET channel_id=excluded.channel_id")

            let channel_id
            if (mode_arg === "here") channel_id = msg.channel.id
            else {
                const getChannel = require("../lib/get_channel")
                const channel = await getChannel(msg, args.slice(1))
                if (channel === undefined) return msg.channel.send(`${__("bad_channel")} ${__("kirino_pout")}`)
                channel_id = channel.id
            }

            presenceRequest.run(msg.guild.id, channel_id, 0)
            msg.channel.send(`${__("presence_channel_set")} <#${channel_id}>. ${__("kirino_glad")}`)
        }

        else {
            let duration = args[0]
            if (duration === undefined || isNaN(duration)) return msg.channel.send(`${__("bad_duration")} ${__("kirino_pout")}`)
            duration = Math.round((parseFloat(duration) + Number.EPSILON) * 100) / 100
            if (duration <= 0 || duration > 30) return msg.channel.send(`${__("duration_out_of_range")} ${__("kirino_pout")}`)

            const presenceRequest = bot.db.prepare("SELECT channel_id, locked FROM presences WHERE guild_id = ?")
            const row = presenceRequest.get(msg.guild.id)

            if (row !== undefined) {
                if (row.locked) return msg.channel.send(`${__("record_still_going_on")} ${__("kirino_pout")}`)

                const channels = msg.guild.channels.cache.array().filter(channel => channel.id === row.channel_id)
                if (channels.length > 0) {
                    const lockRequest = bot.db.prepare("UPDATE presences SET locked = ? WHERE guild_id = ?")
                    lockRequest.run(1, msg.guild.id)

                    const channel = channels[0]
                    msg.delete().catch(() => {})
                    const recordMsg = await msg.channel.send(`**${__("record_started")}** ${__("kirino_glad")}\n${__("you_have")} ${duration} ${__("min_to_raise_the_hand")} 🙋.`)
                    recordMsg.react("🙋")

                    let presents = []
                    const filter = reaction => reaction.emoji.name === '🙋'
                    const collector = recordMsg.createReactionCollector(filter, {time: 1000 * 60 * duration })

                    collector.on("collect", async (reaction, user) => {
                        if (!presents.includes(user)) presents.push(user)
                    })

                    collector.on("end", async () => {
                        presents = presents.filter(user => !user.bot).map(user => {
                            member = msg.guild.member(user)
                            txt = `- ${member.user.tag}`
                            if (member.nickname) txt += ` (${member.nickname})`
                            return txt
                        })
                        msg.channel.send(`**${__("record_ended")}** ${__("kirino_glad")}`)
                        txt = [`**${__("record_from")} ${msg.author.username}${__("s_call")}** :\n`]
                        if (presents.length === 0) txt[0] += __("nobody")
                        let i = 0
                        for (const record of presents) {
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
                                msg.channel.send(`${__("presence_channel_deleted_during_call")} ${__("kirino_what")}`)
                                break
                            }
                        }
                        lockRequest.run(0, msg.guild.id)
                    })
                }
                else {
                    msg.channel.send(`${__("presence_channel_not_found")} ${__("kirino_what")}`)
                    const deletionRequest = bot.db.prepare("DELETE FROM presences WHERE guild_id = ?")
                    deletionRequest.run(msg.guild.id)
                }
                
            }
            else msg.channel.send(`${__("no_presence_channel_set")} ${__("kirino_pout")}`)
        }
	}
}