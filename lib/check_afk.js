function checkAfk(bot, msg) {
    const mentions = msg.mentions.users

    const afkRequest = bot.db.prepare("SELECT * FROM afk WHERE user_id = ?")

    mentions.forEach(mention => {
        const mentionnedAfkRow = afkRequest.get(mention.id)

        if (mentionnedAfkRow !== undefined) {
            if (mentionnedAfkRow.id != msg.author.id) {
                if (mentionnedAfkRow.reason) {
                    msg.channel.send(`**${mention.username}**` + __("afk_with_reason") + mentionnedAfkRow.reason)
                }
                else {
                    msg.channel.send(`**${mention.username}**` + __("afk_without_reason"))
                }
            }
        }
    })

    const selfAfkRow = afkRequest.get(msg.author.id)

    if (selfAfkRow !== undefined) {
        const deletionRequest = bot.db.prepare("DELETE FROM afk WHERE user_id = ?")
        deletionRequest.run(msg.author.id)
        msg.reply(__("deleted_from_afk")).then(msg => msg.delete({ timeout: 5000 })).catch(() => {})
    }
}

module.exports = checkAfk;