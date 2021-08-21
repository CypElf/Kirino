const { Permissions } = require("discord.js")
const resetJoin = require("../../lib/joins_leaves/reset_join")
const formatJoinLeaveMessage = require("../../lib/joins_leaves/format_join_leave_message")
const getChannel = require("../../lib/getters/get_channel")

module.exports = {
    name: "joinmsg",
    guildOnly: true,
    args: true,
    permissions: ["manage_guild"],

    async execute(bot, msg, args) {
        if (!msg.member.permissions.has(Permissions.FLAGS.MANAGE_GUILD)) return msg.channel.send(`${__("not_allowed_to_use_this_command")} ${__("kirino_pff")}`)

        if (args[0] === "reset") {

            if (!resetJoin(bot.db, msg.guild.id)) return msg.channel.send(`${__("already_no_join_message")} ${__("kirino_pout")}`)

            msg.channel.send(`${__("join_message_reset")} ${__("kirino_glad")}`)
        }

        else if (args[0] === "test") {
            const joinRow = bot.db.prepare("SELECT joins_channel_id, join_message FROM joins_leaves WHERE guild_id = ?").get(msg.guild.id)

            if (joinRow) {
                const { joins_channel_id, join_message } = joinRow
                try {
                    await msg.guild.channels.fetch(joins_channel_id) // assert that the channel where the join message should be sent still exists
                    msg.channel.send(formatJoinLeaveMessage(join_message, msg.member))
                }
                catch {
                    resetJoin(bot.db, msg.guild.id)
                    msg.channel.send(`${__("no_join_message_set")} ${__("kirino_glad")}`)
                }
            }
            else {
                msg.channel.send(`${__("no_join_message_set")} ${__("kirino_glad")}`)
            }
        }

        else {
            if (args.length < 2) return msg.channel.send(`${__("need_join_channel_and_message")} ${__("kirino_pout")}`)

            const channel = await getChannel(msg, args.slice(0, 1))

            if (channel === undefined) return msg.channel.send(`${__("bad_channel")} ${__("kirino_pout")}`)

            args.shift()
            const joinMsg = args.join(" ")

            const joinRequest = bot.db.prepare("INSERT INTO joins_leaves(guild_id, joins_channel_id, join_message) VALUES(?,?,?) ON CONFLICT(guild_id) DO UPDATE SET joins_channel_id=excluded.joins_channel_id, join_message=excluded.join_message")
            joinRequest.run(msg.guild.id, channel.id, joinMsg)

            msg.channel.send(`${__("join_message_set")} <#${channel.id}>. ${__("kirino_glad")}`)
        }
    }
}