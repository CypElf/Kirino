function musicControlAuth(channel, member, me) { // control if the bot is in the same voice channel as the member
    if (!me.voice.channel) {
        channel.send(`${__("not_in_any_voice_channel")} ${__("kirino_pout")}`)
        return false
    }
    else if (!member.voice.channel || me.voice.channel.id !== member.voice.channel.id) {
        channel.send(`${__("not_allowed_to_control_music_because_not_in_my_voice_channel")} ${__("kirino_pout")}`)
        return false
    }
    return true
}

module.exports = musicControlAuth