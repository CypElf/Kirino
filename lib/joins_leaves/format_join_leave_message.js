function formatJoinLeaveMessage(message, member) {
    return message
        .replace("{user}", `<@${member.id}>`)
        .replace("{username}", member.user.username)
        .replace("{tag}", member.user.tag)
        .replace("{server}", member.guild.name)
        .replace("{count}", member.guild.memberCount)
}

module.exports = formatJoinLeaveMessage