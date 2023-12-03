import { Message, PartialMessage } from "discord.js"
import { Kirino } from "../misc/types"
import { Banword } from "../misc/database"

export default function checkBanwords(bot: Kirino, msg: Message | PartialMessage) {
    if (msg.guild) {
        const banwordsRequest = bot.db.prepare("SELECT * FROM banwords WHERE guild_id = ?")
        const banwords = banwordsRequest.all(msg.guild.id) as Banword[]

        const emojiMatches = msg.content?.match(/<:(.*?):[0-9]*>/gm)
        let emojiNames: string[] | undefined
        if (emojiMatches) emojiNames = emojiMatches.map(emoji => emoji.split(":")[1].split(":")[0])

        const messageArray = msg.content?.split(" ")
        if (!messageArray) return

        const loweredMessageArray = messageArray?.map(word => word.toLowerCase())
        for (let word of banwords.map(banword => banword.word)) {
            if (loweredMessageArray.includes(word.toLowerCase())) return msg.delete()
            if (emojiNames) {
                if (word.startsWith(":") && word.endsWith(":")) {
                    word = word.substring(1, word.length - 1)
                    if (emojiNames.includes(word)) return msg.delete()
                }
            }
        }
    }
}