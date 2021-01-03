module.exports = bot => {
    bot.once("ready", async () => {
        const updateActivity = require("../lib/misc/update_activity")
        updateActivity(bot)
        let startDate = new Date()
        const startMonth = String(startDate.getMonth() + 1).padStart(2, "0")
        const startDay = String(startDate.getDate()).padStart(2, "0")
        const startYear = startDate.getFullYear()
        const startHour = String(startDate.getHours()).padStart(2, "0")
        const startMinutes = String(startDate.getMinutes()).padStart(2, "0")
        const startSeconds = String(startDate.getSeconds()).padStart(2, "0")
        startDate = `${startHour}:${startMinutes}:${startSeconds} ${startDay}/${startMonth}/${startYear}`
        console.log(`Connection to Discord established (${startDate})`)
    })
}