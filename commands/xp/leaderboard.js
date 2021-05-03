module.exports = {
	name: "leaderboard",
    guildOnly: true,
    args: false,
    aliases: ["lb"],

    async execute (bot, msg, args) {
        const xpActivationRequest = bot.db.prepare("SELECT is_enabled FROM xp_guilds WHERE guild_id = ?")
        let isEnabled = xpActivationRequest.get(msg.guild.id)
        if (isEnabled) isEnabled = isEnabled.is_enabled
        if (!isEnabled) return msg.channel.send(`${__("currently_disabled_enable_with")} \`${bot.prefix}xp enable\`.`)

        const page = args[0]
        const limit = args[1]
        let params = (page ? `/${page}` : "") + (limit ? `/${limit}` : "")

        const lang = getLocale() === "fr" ? "/fr" : ""
        msg.channel.send(`${__("leaderboard_of")}${msg.guild.name}${__("is_available_at")} https://kirino.xyz${lang}/leaderboards/${msg.guild.id}${params} ${__("kirino_glad")}`)
    }
}