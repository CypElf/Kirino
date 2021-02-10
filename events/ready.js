module.exports = bot => {
    bot.once("ready", async () => {
        const updateActivity = require("../lib/misc/update_activity")
        updateActivity(bot)
        const formatDate = require("../lib/misc/format_date")
        const startDate = formatDate(new Date())
        console.log(`Connection to Discord established (${startDate})`)
    })
}