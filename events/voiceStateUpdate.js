module.exports = bot => {
    const timeOut = 3 // in minutes

    bot.on("voiceStateUpdate", async (oldState, newState) => {
        if (oldState.channelId === oldState.guild.me.voice.channelId && !newState.channel) {
            if (oldState.channel != null && !(oldState.channel.members.size - 1)) {
                console.log(`I'm alone in the voice channel ${oldState.channel.name} on the server ${oldState.channel.guild.name}, I'll leave in ${timeOut} minutes if nobody join`)
                setTimeout(() => {
                    const othersUsersCount = oldState.channel.members.size - 1
                    if (othersUsersCount == 0) {
                        console.log(`Still alone in the voice channel ${oldState.channel.name} on the server ${oldState.channel.guild.name}, it's time to leave`)
                        oldState.channel.leave()
                    }
                    else {
                        console.log(`Not alone anymore in the voice channel ${oldState.channel.name} on the server ${oldState.channel.guild.name}, so I won't leave now (${othersUsersCount} user(s) are present)`)
                    }
                }, timeOut * 60 * 1000)
            }
        }
        else if (oldState.id === bot.user.id && oldState.channelId !== null && newState.channelId === null) {
            bot.voicesQueues.delete(oldState.guild.id)
        }
    })
}