function updateActivity(bot) {
    bot.user.setActivity(`${bot.guilds.cache.size} servers | ;help | kirino.xyz`, { type: "LISTENING" /*PLAYING, STREAMING, LISTENING or WATCHING*/ })
}

module.exports = updateActivity