module.exports = bot => {
    bot.on("guildCreate", guild  => {
        const formatDate = require("../lib/misc/format_date")
        console.log(`Server joined: ${guild.name} | ${formatDate(new Date())}`)
        const updateActivity = require("../lib/misc/update_activity")
        updateActivity(bot)
    })
}