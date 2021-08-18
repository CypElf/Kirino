const handleMemberRemove = require("../lib/joins_leaves/handle_member_remove")

module.exports = bot => {
    bot.on("guildMemberRemove", async member => {
        handleMemberRemove(bot.db, member)
    })
}