import { Kirino } from "../lib/misc/types"
import updateActivity from "../lib/misc/update_activity"

export default function ready(bot: Kirino) {
    bot.once("ready", async () => {
        updateActivity(bot)
        console.log("Connection to Discord established")
    })
}