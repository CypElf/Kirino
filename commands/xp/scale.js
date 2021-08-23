module.exports = {
    name: "scale",
    guildOnly: true,
    args: false,
    aliases: ["rate", "coefficient", "coeff"],
    permissions: ["{administrator}"],

    async execute(bot, msg, args) {
        const xpActivationRequest = bot.db.prepare("SELECT is_enabled FROM xp_guilds WHERE guild_id = ?")
        let isEnabled = xpActivationRequest.get(msg.guild.id)
        if (isEnabled) isEnabled = isEnabled.is_enabled
        if (!isEnabled) return msg.channel.send(`${__("currently_disabled_enable_with")} \`${bot.prefix}xp enable\`.`)

        if (args[0] !== undefined) {
            const updateScaleRequest = bot.db.prepare("INSERT INTO xp_guilds(guild_id, is_enabled, scale) VALUES(?,?,?) ON CONFLICT(guild_id) DO UPDATE SET scale=excluded.scale")

            let scale = parseFloat(args[0])
            const choices = [0.25, 0.5, 0.75, 1, 1.5, 2, 2.5, 3]

            if (!choices.includes(scale)) return msg.channel.send(`${__("bad_scale")} ${__("kirino_pout")}`)

            if (scale === 1) scale = null
            updateScaleRequest.run(msg.guild.id, 1, scale)
            if (scale === null) scale = 1

            msg.channel.send(`${__("scale_set")} \`${scale}\`. ${__("kirino_glad")}`)
        }

        else {
            getScaleRequest = bot.db.prepare("SELECT scale FROM xp_guilds WHERE guild_id = ?")
            let scale = getScaleRequest.get(msg.guild.id).scale
            if (scale === null) scale = 1

            msg.channel.send(`${__("current_scale_is")} \`${scale}\`. ${__("kirino_glad")}`)
        }
    }
}