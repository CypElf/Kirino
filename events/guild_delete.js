module.exports = bot => {
    bot.on("guildDelete", guild => {
        const formatDate = require("../lib/misc/format_date")
        console.log(`Server left: ${guild.name} | ${formatDate(new Date())}`)
    
        for (const table of ["banwords", "rules", "calls", "joins_leaves", "xp_blacklisted_channels", "xp_blacklisted_roles", "xp_guilds", "xp_roles"]) bot.db.prepare(`DELETE FROM ${table} WHERE guild_id = ?`).run(guild.id)
        for (const table of ["languages", "prefixs"]) bot.db.prepare(`DELETE FROM ${table} WHERE id = ?`).run(guild.id)
    
        const updateActivity = require("../lib/misc/update_activity")
        updateActivity(bot)
    })
}