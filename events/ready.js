const updateActivity = require("../lib/misc/update_activity")

module.exports = bot => {
    bot.once("ready", async () => {
        updateActivity(bot)
        console.log("Connection to Discord established")
    })
}