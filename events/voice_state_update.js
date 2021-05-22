module.exports = bot => {
    const formatDate = require("../lib/misc/format_date")

    const timeOut = 3 // in minutes

    bot.on("voiceStateUpdate", async (oldState, newState) => {
        if (oldState.channelID === oldState.guild.me.voice.channelID && !newState.channel) {
            if (oldState.channel != null && !(oldState.channel.members.size - 1)) {
                console.log(`I'm alone in the voice channel ${oldState.channel.name} on the server ${oldState.channel.guild.name}, I'll leave in ${timeOut} minutes if nobody join | ${formatDate(new Date())}`)
                setTimeout(() => {
                    const othersUsersCount = oldState.channel.members.size - 1
                    if (othersUsersCount == 0) {
                        console.log(`Still alone in the voice channel ${oldState.channel.name} on the server ${oldState.channel.guild.name}, it's time to leave | ${formatDate(new Date())}`)
                        oldState.channel.leave()
                    }
                    else {
                        console.log(`Not alone anymore in the voice channel ${oldState.channel.name} on the server ${oldState.channel.guild.name}, so I won't leave now (${othersUsersCount} user(s) are present) | ${formatDate(new Date())}`)
                    }
                }, timeOut * 60 * 1000)
            }
        }
        else if (oldState.id === bot.user.id && oldState.channelID !== null && newState.channelID === null) {
            bot.voicesQueues.delete(oldState.guild.id)
        }
    })
}