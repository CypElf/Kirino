import { Kirino } from "../lib/misc/types"
import checkBanwords from "../lib/banwords/check_banwords"

export function eventHandler(bot: Kirino) {
    bot.on("messageUpdate", async (oldMsg, newMsg) => {
        checkBanwords(bot, newMsg)
    })
}