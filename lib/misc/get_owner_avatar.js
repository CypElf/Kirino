function getOwnerAvatar(bot) {
    const ownerId = process.env.OWNER_ID
    const owner = bot.users.cache.get(ownerId)
    if (owner) {
        return owner.displayAvatarURL()
    }
}

module.exports = getOwnerAvatar