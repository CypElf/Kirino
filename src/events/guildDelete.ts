import { Kirino } from "../lib/misc/types"
import updateActivity from "../lib/misc/update_activity"

export function eventHandler(bot: Kirino) {
    bot.on("guildDelete", async guild => {
        if (guild.name) console.log(`Server left: ${guild.name}`)

        for (const table of ["banwords", "rules", "calls", "joins_leaves", "xp_blacklisted_channels", "xp_blacklisted_roles", "xp_guilds", "xp_roles"]) bot.db.prepare(`DELETE FROM ${table} WHERE guild_id = ?`).run(guild.id)
        bot.db.prepare(`DELETE FROM languages WHERE id = ?`).run(guild.id)

        updateActivity(bot)
    })
}