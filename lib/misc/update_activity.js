function updateActivity(bot) {
    bot.user.setPresence({ activities: [{ name: `${bot.guilds.cache.size} servers | ;help | kirino.xyz`, type: "LISTENING" /*PLAYING, STREAMING, LISTENING or WATCHING*/ }], status: "dnd" })
}

module.exports = updateActivity