module.exports = bot => {
    bot.once("ready", async () => {
        const updateActivity = require("../lib/misc/update_activity")
        updateActivity(bot)
        console.log("Connection to Discord established")
    })
}