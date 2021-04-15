module.exports = bot => {
    const timeOut = 5 // in minutes

    bot.on("voiceStateUpdate", async (oldState, newState) => {
        if (oldState.channelID === oldState.guild.me.voice.channelID && !newState.channel) {
            if (oldState.channel != null && !oldState.channel.members.size - 1) {
                setTimeout(() => {
                    if (!oldState.channel.members.size - 1) {
                        oldState.channel.leave()
                    }
                }, timeOut * 60 * 1000)
            }
        }
        else if (oldState.id === bot.user.id && oldState.channelID !== null && newState.channelID === null) {
            bot.voicesQueues.delete(oldState.guild.id)
        }
    })
}