const { Permissions } = require("discord.js")
const resetLeave = require("../../lib/joins_leaves/reset_leave")
const formatJoinLeaveMessage = require("../../lib/joins_leaves/format_join_leave_message")
const getChannel = require("../../lib/getters/get_channel")

module.exports = {
    name: "leavemsg",
    guildOnly: true,
    args: true,
    permissions: ["manage_guild"],

    async execute(bot, msg, args) {
        if (!msg.member.permissions.has(Permissions.FLAGS.MANAGE_GUILD)) return msg.channel.send(`${__("not_allowed_to_use_this_command")} ${__("kirino_pff")}`)

        if (args[0] === "reset") {

            if (!resetLeave(bot.db, msg.guild.id)) return msg.channel.send(`${__("already_no_leave_message")} ${__("kirino_pout")}`)

            msg.channel.send(`${__("leave_message_reset")} ${__("kirino_glad")}`)
        }

        else if (args[0] === "test") {
            const leaveRow = bot.db.prepare("SELECT leaves_channel_id, leave_message FROM joins_leaves WHERE guild_id = ?").get(msg.guild.id)

            if (leaveRow) {
                const { leaves_channel_id, leave_message } = leaveRow
                try {
                    await msg.guild.channels.fetch(leaves_channel_id) // assert that the channel where the join message should be sent still exists
                    msg.channel.send(formatJoinLeaveMessage(leave_message, msg.member))
                }
                catch {
                    resetLeave(bot.db, msg.guild.id)
                    msg.channel.send(`${__("no_leave_message_set")} ${__("kirino_glad")}`)
                }
            }
            else {
                msg.channel.send(`${__("no_leave_message_set")} ${__("kirino_glad")}`)
            }
        }

        else {
            if (args.length < 2) return msg.channel.send(`${__("need_leave_channel_and_message")} ${__("kirino_pout")}`)

            const channel = await getChannel(msg, args.slice(0, 1))

            if (channel === undefined) return msg.channel.send(`${__("bad_channel")} ${__("kirino_pout")}`)

            args.shift()
            const leaveMsg = args.join(" ")

            const leaveRequest = bot.db.prepare("INSERT INTO joins_leaves(guild_id, leaves_channel_id, leave_message) VALUES(?,?,?) ON CONFLICT(guild_id) DO UPDATE SET leaves_channel_id=excluded.leaves_channel_id, leave_message=excluded.leave_message")
            leaveRequest.run(msg.guild.id, channel.id, leaveMsg)

            msg.channel.send(`${__("leave_message_set")} <#${channel.id}>. ${__("kirino_glad")}`)
        }
    }
}