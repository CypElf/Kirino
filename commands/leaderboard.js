module.exports = {
	name: "leaderboard",
    description: "description_leaderboard",
    guildOnly: true,
    args: false,
    category: "xp",
    aliases: ["lb"],

    async execute (bot, msg, args) {
        const xpActivationRequest = bot.db.prepare("SELECT is_enabled FROM xp_metadata WHERE guild_id = ?")
        let isEnabled = xpActivationRequest.get(msg.guild.id)
        if (isEnabled) isEnabled = isEnabled.is_enabled

        if (isEnabled) msg.channel.send(`${__("leaderboard_of")}${msg.guild.name}${__("is_available_at")} https://www.avdray.com/leaderboards?gid=${msg.guild.id} ${__("kirino_glad")}`)
        else msg.channel.send(`${currently_disabled_enable_with} \`${bot.prefix}xp enable\`.`)
    }
}