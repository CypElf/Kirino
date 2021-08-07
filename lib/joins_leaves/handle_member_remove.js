function handleMemberRemove(db, member, channel_id = undefined) {
    const leaveRequest = db.prepare("SELECT leaves_channel_id, leave_message FROM joins_leaves WHERE guild_id = ?")
    const leaveRow = leaveRequest.get(member.guild.id)
    if (leaveRow === undefined) return false
    if (channel_id !== undefined) leaveRow.leaves_channel_id = channel_id
    if (leaveRow.leaves_channel_id === null || leaveRow.leave_message === null) return false
    let leaveMsg = leaveRow.leave_message
    const channelId = leaveRow.leaves_channel_id

    const serverChannels = [...member.guild.channels.cache.values()].filter(channel => channel.id === channelId)

    if (serverChannels.length === 0) {
        // the leave channel doesn't exist in the server anymore, so we have to remove its entry
        const resetLeave = require("./reset_leave")
        resetLeave(db, member.guild.id)

        return false
    }

    const leaveChannel = serverChannels[0]
    leaveMsg = leaveMsg
        .replace("{user}", `<@${member.id}>`)
        .replace("{username}", member.user.username)
        .replace("{tag}", member.user.tag)
        .replace("{server}", member.guild.name)
        .replace("{count}", member.guild.memberCount)

    leaveChannel.send(leaveMsg)
    return true
}

module.exports = handleMemberRemove