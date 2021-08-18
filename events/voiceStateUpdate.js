const { getVoiceConnection } = require("@discordjs/voice")

module.exports = bot => {
    const timeOut = 3 // in minutes

    bot.on("voiceStateUpdate", async (oldState, newState) => {
        if (oldState.channelId === oldState.guild.me.voice.channelId && !newState.channel) {
            const othersUsersCount = oldState.channel.members.size - 1

            if (oldState.channel != null && othersUsersCount === 0) {
                console.log(`I'm alone in the voice channel ${oldState.channel.name} on the server ${oldState.channel.guild.name}, I'll leave in ${timeOut} minutes if nobody join`)
                setTimeout(() => {
                    const othersUsersCountAfterWait = oldState.channel.members.size - 1
                    if (othersUsersCountAfterWait === 0) {
                        console.log(`Still alone in the voice channel ${oldState.channel.name} on the server ${oldState.channel.guild.name}, it's time to leave`)
                        disconnect(oldState.guild.id)
                    }
                    else {
                        console.log(`Not alone anymore in the voice channel ${oldState.channel.name} on the server ${oldState.channel.guild.name}, so I won't leave now (${othersUsersCountAfterWait} user(s) are present)`)
                    }
                }, timeOut * 60 * 1000)
            }
        }
        else if (oldState.id === bot.user.id && oldState.channelId !== null && newState.channelId === null) {
            disconnect(oldState.guild.id)
        }
    })

    function disconnect(guild_id) {
        const connection = getVoiceConnection(guild_id)

        if (connection) {
            bot.voicesQueues.get(guild.id).player.stop()
            connection.destroy()
            bot.voicesQueues.delete(guild_id)
        }
    }
}