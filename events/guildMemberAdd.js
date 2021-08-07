module.exports = bot => {
    bot.on("guildMemberAdd", async member => {
        const handleMemberAdd = require("../lib/joins_leaves/handle_member_add")
        handleMemberAdd(bot.db, member)
    })
}