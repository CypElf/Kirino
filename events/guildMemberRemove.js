module.exports = bot => {
    bot.on("guildMemberRemove", async member => {
        const handleMemberRemove = require("../lib/joins_leaves/handle_member_remove")
        handleMemberRemove(bot.db, member)
    })
}