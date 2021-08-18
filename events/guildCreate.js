const updateActivity = require("../lib/misc/update_activity")

module.exports = bot => {
    bot.on("guildCreate", guild => {
        console.log(`Server joined: ${guild.name}`)
        updateActivity(bot)
    })
}