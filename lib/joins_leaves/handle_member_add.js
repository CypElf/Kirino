function handleMemberAdd(db, member, channel_id = undefined) {
    const joinRequest = db.prepare("SELECT joins_channel_id, join_message FROM joins_leaves WHERE guild_id = ?")
    const joinRow = joinRequest.get(member.guild.id)
    if (joinRow === undefined) return false
    if (channel_id !== undefined) joinRow.joins_channel_id = channel_id
    if (joinRow.joins_channel_id === null || joinRow.join_message === null) return false
    let joinMsg = joinRow.join_message
    const channelId = joinRow.joins_channel_id

    const serverChannels = [...member.guild.channels.cache.values()].filter(channel => channel.id === channelId)

    if (serverChannels.length === 0) {
        // the join channel doesn't exist in the server anymore, so we have to remove its entry
        const resetJoin = require("./reset_join")
        resetJoin(db, member.guild.id)

        return false
    }

    const joinChannel = serverChannels[0]
    joinMsg = joinMsg
        .replace("{user}", `<@${member.id}>`)
        .replace("{username}", member.user.username)
        .replace("{tag}", member.user.tag)
        .replace("{server}", member.guild.name)
        .replace("{count}", member.guild.memberCount)

    joinChannel.send(joinMsg)
    return true
}

module.exports = handleMemberAdd