module.exports = {
	name: "leaderboard",
    guildOnly: true,
    args: false,
    category: "xp",
    aliases: ["lb"],

    async execute (bot, msg, args) {
        const xpActivationRequest = bot.db.prepare("SELECT is_enabled FROM xp_guilds WHERE guild_id = ?")
        let isEnabled = xpActivationRequest.get(msg.guild.id)
        if (isEnabled) isEnabled = isEnabled.is_enabled
        if (!isEnabled) return msg.channel.send(`${__("currently_disabled_enable_with")} \`${bot.prefix}xp enable\`.`)

        let params = ""
            if (args[0]) params = `&limit=${args[0]}`
            if (args[1]) params += `&page=${args[1]}`
            msg.channel.send(`${__("leaderboard_of")}${msg.guild.name}${__("is_available_at")} https://www.kirino.xyz/leaderboards?gid=${msg.guild.id}${params} ${__("kirino_glad")}`)
    }
}