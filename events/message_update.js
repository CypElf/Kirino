module.exports = bot => {
    bot.on("messageUpdate", async (oldMsg, newMsg) => {
        const checkBanwords = require("../lib/banwords/check_banwords")
        checkBanwords(bot, newMsg)
    })
}