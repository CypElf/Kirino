const handleMemberAdd = require("../lib/joins_leaves/handle_member_add")

module.exports = bot => {
    bot.on("guildMemberAdd", async member => {
        handleMemberAdd(bot.db, member)
    })
}