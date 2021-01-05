function updateActivity(bot) {
    bot.user.setPresence({ activity: { name: `${bot.guilds.cache.size} servers | ;help | kirino.xyz`, type: "LISTENING" /*PLAYING, STREAMING, LISTENING or WATCHING*/ }, status: "dnd" })
}

module.exports = updateActivity