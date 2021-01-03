module.exports = bot => {
    bot.on("guildCreate", guild  => {
        console.log(`Server joined: ${guild.name}`)
        const updateActivity = require("../lib/misc/update_activity")
        updateActivity(bot)
    })
}