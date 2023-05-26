import { Kirino } from "../lib/misc/types"
import updateActivity from "../lib/misc/update_activity"

export function eventHandler(bot: Kirino) {
    bot.on("guildCreate", guild => {
        console.log(`Server joined: ${guild.name}`)
        updateActivity(bot)
    })
}