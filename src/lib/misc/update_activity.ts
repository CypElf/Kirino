import { ActivityType } from "discord.js"
import { Kirino } from "./types"

export default function updateActivity(bot: Kirino) {
    bot.user?.setPresence({ activities: [{ name: "kirino.xyz", type: ActivityType.Watching /* PLAYING, STREAMING, LISTENING or WATCHING */ }], status: "dnd" })
}