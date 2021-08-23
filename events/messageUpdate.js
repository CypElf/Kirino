const checkBanwords = require("../lib/banwords/check_banwords")

module.exports = bot => {
    bot.on("messageUpdate", async (oldMsg, newMsg) => {
        checkBanwords(bot, newMsg)
    })
}