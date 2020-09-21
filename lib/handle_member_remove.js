function handleMemberRemove(bot, member) {
    const leaveRequest = bot.db.prepare("SELECT leaves_channel_id, leave_message FROM joins_leaves WHERE guild_id = ?")
    const leaveRow = leaveRequest.get(member.guild.id)
    if (leaveRow === undefined || leaveRow.leaves_channel_id === null || leaveRow.leave_message === null) return
    let leaveMsg = leaveRow.leave_message
    const channelId = leaveRow.leaves_channel_id

    const serverChannels = member.guild.channels.cache.array().filter(channel => channel.id === channelId)

    if (serverChannels.length === 0) {
        // the leave channel doesn't exist in the server anymore, so we have to remove its entry
        const resetLeave = require("./reset_leave")
        resetLeave(bot.db, member.guild.id)
    }

    else {
        const leaveChannel = serverChannels[0]
        leaveMsg = leaveMsg
            .replace("{user}", `<@${member.id}>`)
            .replace("{username}", member.user.username)
            .replace("{tag}", member.user.tag)
            .replace("{server}", member.guild.name)

        leaveChannel.send(leaveMsg)
    }
}

module.exports = handleMemberRemove