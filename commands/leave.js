module.exports = {
	name: "leave",
    description: "description_leave",
    guildOnly: true,
    args: true,
    category: "admin",
    usage: "usage_leave",
    permissions: ["manage_guild"],

    async execute (bot, msg, args) {
        if (!msg.member.hasPermission("MANAGE_GUILD")) return msg.channel.send("Not allowed to use this command")

        if (args[0] === "reset") {
            const resetLeave = require("../lib/reset_leave")

            if (!resetLeave(bot.db, msg.guild.id)) msg.channel.send("Already nothing")

            return msg.channel.send("Leave message successfully reset")
        }

        if (args.length < 2) return msg.channel.send("Need 2 args")

        const getChannel = require("../lib/get_channel")
        const channel = await getChannel(msg, args.slice(0, 1))

        if (channel === undefined) return msg.channel.send(__("bad_channel"))
        
        args.shift()
        const leaveMsg = args.join(" ")

        const leaveRequest = bot.db.prepare("INSERT INTO joins_leaves(guild_id, leaves_channel_id, leave_message) VALUES(?,?,?) ON CONFLICT(guild_id) DO UPDATE SET leaves_channel_id=excluded.leaves_channel_id, leave_message=excluded.leave_message")
        leaveRequest.run(msg.guild.id,channel.id, leaveMsg)

        msg.channel.send("Message successfully set")
    }
}