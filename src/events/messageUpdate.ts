import { Kirino } from "../lib/misc/types"
import checkBanwords from "../lib/banwords/check_banwords"

export default function messageUpdate(bot: Kirino) {
    bot.on("messageUpdate", async (oldMsg, newMsg) => {
        checkBanwords(bot, newMsg)
    })
}