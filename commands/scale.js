module.exports = {
	name: "scale",
    description: "description_scale",
    guildOnly: true,
    args: false,
    category: "xp",
    aliases: ["rate"],
    usage: "usage_scale",

    async execute (bot, msg, args) {
        const xpActivationRequest = bot.db.prepare("SELECT is_enabled FROM xp_metadata WHERE guild_id = ?")
        let isEnabled = xpActivationRequest.get(msg.guild.id)
        if (isEnabled) isEnabled = isEnabled.is_enabled
        if (!isEnabled) return msg.channel.send(`${__("currently_disabled_enable_with")} \`${bot.prefix}xp enable\`.`)

        if (args[0] !== undefined) {
            const updateScaleRequest = bot.db.prepare("INSERT INTO xp_metadata(guild_id, is_enabled, scale) VALUES(?,?,?) ON CONFLICT(guild_id) DO UPDATE SET scale=excluded.scale")

            if (args[0] === "reset") {
                updateScaleRequest.run(msg.guild.id, 1, null)
                msg.channel.send("reset")
            }
            else {
                const scale = parseFloat(args[0])
                const choices = [0.25, 0.5, 0.75, 1.5, 2, 2.5, 3]
        
                if (!choices.includes(scale)) return msg.channel.send("navn")

                updateScaleRequest.run(msg.guild.id, 1, scale)
                msg.channel.send("done")
            }
        }

        else {
            getScaleRequest = bot.db.prepare("SELECT scale FROM xp_metadata WHERE guild_id = ?")
            let scale = getScaleRequest.get(msg.guild.id).scale
            if (scale === null) scale = 1

            msg.channel.send(scale)
        }
    }
}