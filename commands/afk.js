module.exports = {
	name: "afk",
    description: "description_afk",
    guildOnly: true,
    args: false,
    category: "utility",
    usage: "usage_afk",

    async execute (bot, msg, args) {
        let reason
        if (args) {
            reason = args.join(' ')
        }

        if (reason && reason.length > 1800) {
            return msg.channel.send(__("afk_reason_too_long") + " <:kirinopout:698923065773522944>")
        }

        const afkRequest = bot.db.prepare("INSERT INTO afk(user_id,reason) VALUES(?,?)")
        afkRequest.run(msg.author.id, reason)

        if (reason) {
            return msg.reply(__("added_to_afk_with_reason") + " <:kirinoglad:698923046819594351> : " + reason)
        }
        else {
            return msg.reply(__("added_to_afk_without_reason") + " <:kirinoglad:698923046819594351>")
        }
    }
}