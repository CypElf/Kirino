function getRole(msg, args) {
    let role = msg.mentions.roles.first()
    if (role === undefined) {
        let roleNameOrID = args.join(" ")
        role = msg.guild.roles.cache.array().find(currentRole => currentRole.name.toLowerCase() === roleNameOrID.toLowerCase())
        if (role === undefined) {
            role = msg.guild.roles.cache.array().find(currentRole => currentRole.id === roleNameOrID)
        }
    }

    return role
}

module.exports = getRole;