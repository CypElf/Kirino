import { Kirino } from "../lib/misc/types"
import checkBanwords from "../lib/banwords/check_banwords"
import { Events } from "discord.js"

export function eventHandler(bot: Kirino) {
    bot.on(Events.MessageUpdate, async (oldMsg, newMsg) => {
        checkBanwords(bot, newMsg)
    })
}