module.exports = {
	name: "leaderboard",
    description: "description_leaderboard",
    guildOnly: true,
    args: false,
    category: "utility",
    usage: "usage_leaderboard",
    aliases: ["lb"],

    async execute (bot, msg, args) {
        const xpActivationRequest = bot.db.prepare("SELECT is_enabled FROM xp_metadata WHERE guild_id = ?")
        let isEnabled = xpActivationRequest.get(msg.guild.id)
        if (isEnabled) isEnabled = isEnabled.is_enabled

        if (isEnabled) msg.channel.send(`${msg.guild.name}'s leaderboard is available at https://www.avdray.com/leaderboards?gid=${msg.guild.id}`)
        else msg.channel.send(`The XP system is currently disabled. You must first activate it with the command \`${bot.prefix}xp enable\`.`)
    }
}