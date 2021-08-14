function musicControlAuth(member, me) { // return true if the bot is in the same voice channel as the member
    return me.voice.channel && member.voice.channel && me.voice.channelId === member.voice.channelId
}

module.exports = musicControlAuth