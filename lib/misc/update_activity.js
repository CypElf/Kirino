function updateActivity(bot) {
    bot.user.setPresence({ activity: { name: "slashing the void | ;help | kirino.xyz", type: "LISTENING" /*PLAYING, STREAMING, LISTENING or WATCHING*/ }, status: "dnd" })
}

module.exports = updateActivity