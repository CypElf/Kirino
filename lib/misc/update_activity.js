function updateActivity(bot) {
    bot.user.setPresence({ activities: [{ name: "kirino.xyz", type: "WATCHING" /* PLAYING, STREAMING, LISTENING or WATCHING */ }], status: "dnd" })
}

module.exports = updateActivity