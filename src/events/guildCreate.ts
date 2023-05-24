import { Kirino } from "../lib/misc/types"
import updateActivity from "../lib/misc/update_activity"

export default function guildCreate(bot: Kirino) {
    bot.on("guildCreate", guild => {
        console.log(`Server joined: ${guild.name}`)
        updateActivity(bot)
    })
}