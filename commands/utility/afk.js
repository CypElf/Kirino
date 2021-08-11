module.exports = {
    name: "afk",
    guildOnly: true,
    args: false,

    async execute(bot, msg, args) {
        let reason
        if (args) {
            reason = args.join(" ")
        }

        if (reason && reason.length > 1800) {
            return msg.channel.send(`${__("afk_reason_too_long")} ${__("kirino_pout")}`)
        }

        const afkRequest = bot.db.prepare("INSERT INTO afk(user_id,reason) VALUES(?,?)")
        afkRequest.run(msg.author.id, reason)

        if (reason) {
            return msg.reply(`${__("added_to_afk_with_reason")} ${__("kirino_glad")} : ${reason}`)
        }
        else {
            return msg.reply(`${__("added_to_afk_without_reason")} ${__("kirino_glad")}`)
        }
    }
}