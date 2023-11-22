import { Events } from "discord.js"
import { Kirino } from "../lib/misc/types"
import updateActivity from "../lib/misc/update_activity"

export function eventHandler(bot: Kirino) {
    bot.on(Events.GuildCreate, guild => {
        console.log(`Server joined: ${guild.name}`)
        updateActivity(bot)
    })
}