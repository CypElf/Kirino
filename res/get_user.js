function getUser(msg, args) {
    member = msg.mentions.members.first()
    if (member === undefined) {
        let usernameOrID = args.join(" ")
        member = msg.guild.members.cache.array().find(currentMember => {
            if (currentMember.nickname) return currentMember.nickname.toLowerCase() === usernameOrID.toLowerCase()
            else return false
        })
        if (member === undefined) {
            member = msg.guild.members.cache.array().find(currentMember => currentMember.user.username.toLowerCase() === usernameOrID.toLowerCase())
            if (member === undefined) {
                member = msg.guild.members.cache.array().find(currentMember => currentMember.id === usernameOrID)
            }
        }
    }

    return member
}

module.exports = getUser;