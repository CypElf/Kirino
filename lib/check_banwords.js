function checkBanwords(bot, msg) {
    if (msg.guild) {
        if (!msg.content.startsWith(bot.prefix + "banword remove") && !msg.content.startsWith(bot.prefix + "bw remove") && !msg.content.startsWith(bot.prefix + "banword add") && !msg.content.startsWith(bot.prefix + "bw add")) {
    
            const banwordsRequest = bot.db.prepare("SELECT * FROM banwords WHERE guild_id = ?")
            let banwords = banwordsRequest.all(msg.guild.id)
    
            if (banwords) {
                banwords = banwords.map(row => row.word.toLowerCase())
                let emojiNames = msg.content.match(/<:(.*?):[0-9]*>/gm)
                if (emojiNames) emojiNames = emojiNames.map(emoji => emoji.split(":")[1].split(":")[0])
                const messageArray = msg.content.split(" ")
                const loweredMessageArray = messageArray.map(word => word.toLowerCase())
                for (let word of banwords) {
                    if (loweredMessageArray.includes(word.toLowerCase())) return msg.delete().catch(() => {})
                    if (emojiNames) {
                        if (word.startsWith(":") && word.endsWith(":")) {
                            word = word.substring(1, word.length - 1)
                            if (emojiNames.includes(word)) return msg.delete().catch(() => {})
                        }
                    }
                }
            }
        }
    }
}

module.exports = checkBanwords