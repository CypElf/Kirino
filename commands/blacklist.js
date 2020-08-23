module.exports = {
	name: "blacklist",
    description: "description_blacklist",
    guildOnly: true,
    args: true,
    category: "xp",
    usage: "usage_blacklist",
    aliases: ["bl"],
    permissions: ["{administrator}"],

    async execute (bot, msg, args) {
        const xpActivationRequest = bot.db.prepare("SELECT is_enabled FROM xp_metadata WHERE guild_id = ?")
        let isEnabled = xpActivationRequest.get(msg.guild.id)
        if (isEnabled) isEnabled = isEnabled.is_enabled

        if (!isEnabled) return msg.channel.send(`${__("currently_disabled_enable_with")} \`${bot.prefix}xp enable\`.`)

        const arg = args[0]
        const getChannel = require("../res/get_channel")

        const channelRequest = bot.db.prepare("SELECT * FROM xp_channels WHERE guild_id = ?")

        const removeDeletedChannels = require("../res/remove_deleted_channels")
        removeDeletedChannels(bot.db, msg.guild)

        if (arg === "remove") {
            if (!msg.member.hasPermission("ADMINISTRATOR")) return msg.channel.send("you're missing perm to remove remove channels")
            const channelArg = args[1]
            if (!channelArg) return msg.channel.send("precise channel to remove")
            
            const channel = getChannel(msg, args.slice(1))
            if (!channel) return msg.channel.send(`bad channel ${__("kirino_pout")}`)

            const spChannelRequest = bot.db.prepare("SELECT * FROM xp_channels WHERE guild_id = ? AND channel_id = ?")
            const channelRow = spChannelRequest.get(msg.guild.id, channel.id)

            if (!channelRow) return msg.channel.send("channel not in db")

            const deletionChannelRequest = bot.db.prepare("DELETE FROM xp_channels WHERE guild_id = ? AND channel_id = ?")
            deletionChannelRequest.run(msg.guild.id, channel.id)

            msg.channel.send("channel removed from db")
        }
        else {
            if (!msg.member.hasPermission("ADMINISTRATOR")) return msg.channel.send("missing perm to add channel")

            let channel = getChannel(msg, args)

            if (!channel) return msg.channel.send(`bad channel ${__("kirino_pout")}`)

            const channelsRows = channelRequest.all(msg.guild.id)

            if (channelsRows.map(row => row.channel_id).filter(channel_id => channel_id === channel.id).length > 0) return msg.channel.send("channel already present")

            if (channelsRows.length === 10) return msg.channel.send("max channels count reached")

            const addChannelRequest = bot.db.prepare("INSERT INTO xp_channels VALUES(?,?)")
            addChannelRequest.run(msg.guild.id, channel.id)

            msg.channel.send(`the channel ${channel.name} has been added to list`)
        }
    }
}