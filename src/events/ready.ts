import { Kirino } from "../lib/misc/types"
import updateActivity from "../lib/misc/update_activity"

export function eventHandler(bot: Kirino) {
    bot.once("ready", async () => {
        updateActivity(bot)
        console.log("Connection to Discord established")
    })
}