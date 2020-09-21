function handleMemberAdd(bot, member) {
    const joinRequest = bot.db.prepare("SELECT joins_channel_id, join_message FROM joins_leaves WHERE guild_id = ?")
    const joinRow = joinRequest.get(member.guild.id)
    if (joinRow === undefined || joinRow.joins_channel_id === null || joinRow.join_message === null) return
    let joinMsg = joinRow.join_message
    const channelId = joinRow.joins_channel_id

    const serverChannels = member.guild.channels.cache.array().filter(channel => channel.id === channelId)

    if (serverChannels.length === 0) {
        // the join channel doesn't exist in the server anymore, so we have to remove its entry
        const resetJoin = require("./reset_join")
        resetJoin(bot.db, member.guild.id)
    }

    else {
        const joinChannel = serverChannels[0]
        joinMsg = joinMsg
            .replace("{user}", `<@${member.id}>`)
            .replace("{username}", member.user.username)
            .replace("{tag}", member.user.tag)
            .replace("{server}", member.guild.name)

        joinChannel.send(joinMsg)
    }
}

module.exports = handleMemberAdd