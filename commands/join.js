module.exports = {
	name: "join",
    description: "description_join",
    guildOnly: true,
    args: true,
    category: "admin",
    usage: "usage_join",
    permissions: ["manage_guild"],

    async execute (bot, msg, args) {
        if (!msg.member.hasPermission("MANAGE_GUILD")) return msg.channel.send("Not allowed to use this command")

        if (args[0] === "reset") {
            const resetJoin = require("../lib/reset_join")
            resetJoin(bot.db, msg.guild.id)

            if (!resetJoin(bot.db, msg.guild.id)) return msg.channel.send("Already nothing")

            return msg.channel.send("Join message successfully reset")
        }

        if (args.length < 2) return msg.channel.send("Need 2 args")

        const getChannel = require("../lib/get_channel")
        const channel = await getChannel(msg, args.slice(0, 1))

        if (channel === undefined) return msg.channel.send(__("bad_channel"))
        
        args.shift()
        const joinMsg = args.join(" ")

        const joinRequest = bot.db.prepare("INSERT INTO joins_leaves(guild_id, joins_channel_id, join_message) VALUES(?,?,?) ON CONFLICT(guild_id) DO UPDATE SET joins_channel_id=excluded.joins_channel_id, join_message=excluded.join_message")
        joinRequest.run(msg.guild.id, channel.id, joinMsg)

        msg.channel.send("Message successfully set")
    }
}