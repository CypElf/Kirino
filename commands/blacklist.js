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
        const xpActivationRequest = bot.db.prepare("SELECT is_enabled FROM xp_guilds WHERE guild_id = ?")
        let isEnabled = xpActivationRequest.get(msg.guild.id)
        if (isEnabled) isEnabled = isEnabled.is_enabled

        if (!isEnabled) return msg.channel.send(`${__("currently_disabled_enable_with")} \`${bot.prefix}xp enable\`.`)

        const arg = args[0]
        const getChannel = require("../lib/get_channel")

        const channelRequest = bot.db.prepare("SELECT * FROM xp_blacklisted_channels WHERE guild_id = ?")

        const removeDeletedBlacklistedChannels = require("../lib/remove_deleted_channels")
        removeDeletedBlacklistedChannels(bot.db, msg.guild)

        if (arg === "remove") {
            if (!msg.member.hasPermission("ADMINISTRATOR")) return msg.channel.send(`${__("missing_permissions_to_remove_channel")} ${__("kirino_pff")}`)
            const channelArg = args[1]
            if (!channelArg) return msg.channel.send(`${__("precise_channel_to_remove")} ${__("kirino_pout")}`)
            
            const channel = await getChannel(msg, args.slice(1))
            if (!channel) return msg.channel.send(`${__("bad_channel")} ${__("kirino_pout")}`)

            const spChannelRequest = bot.db.prepare("SELECT * FROM xp_blacklisted_channels WHERE guild_id = ? AND channel_id = ?")
            const channelRow = spChannelRequest.get(msg.guild.id, channel.id)

            if (!channelRow) return msg.channel.send(`${__("channel_not_in_db")} ${__("kirino_pout")}`)

            const deletionChannelRequest = bot.db.prepare("DELETE FROM xp_blacklisted_channels WHERE guild_id = ? AND channel_id = ?")
            deletionChannelRequest.run(msg.guild.id, channel.id)

            msg.channel.send(`${__("the_channel")} ${channel.name} ${__("has_been_removed_to_list")} ${__("kirino_glad")}`)
        }
        else if (arg === "list") {
            const channelsRows = channelRequest.all(msg.guild.id).map(row => row.channel_id)
            const blacklistedChannels = msg.guild.channels.cache.array().filter(channel => channelsRows.includes(channel.id)).map(channel => channel.name)

            const Discord = require("discord.js")
            const blacklistEmbed = new Discord.MessageEmbed()
                .setTitle(__("channels_blacklisted"))
                .setColor("#000000")

            if (blacklistedChannels.length === 0) blacklistEmbed.setDescription(__("no_blacklisted_channels"))
            else blacklistEmbed.setDescription(`\`${blacklistedChannels.join("`, `")}\``)

            msg.channel.send(blacklistEmbed)
        }
        else {
            if (!msg.member.hasPermission("ADMINISTRATOR")) return msg.channel.send(__("missing_perm_to_add_channel"))

            let channel = await getChannel(msg, args)

            if (!channel) return msg.channel.send(`${__("bad_channel")} ${__("kirino_pout")}`)

            const channelsRows = channelRequest.all(msg.guild.id)

            if (channelsRows.map(row => row.channel_id).filter(channel_id => channel_id === channel.id).length > 0) return msg.channel.send(__("channel_already_present"))

            if (channelsRows.length === 10) return msg.channel.send(`${__("max_channels_count_reached")} ${__("kirino_pout")}`)

            const addChannelRequest = bot.db.prepare("INSERT INTO xp_blacklisted_channels VALUES(?,?)")
            addChannelRequest.run(msg.guild.id, channel.id)

            msg.channel.send(`${__("the_channel")} ${channel.name} ${__("has_been_added_to_list")} ${__("kirino_glad")}`)
        }
    }
}