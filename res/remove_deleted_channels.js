function removeDeletedChannels(db, guild) {
    const channelsRequest = db.prepare("SELECT * FROM xp_channels WHERE guild_id = ?")
    let channelsRows = channelsRequest.all(guild.id)

    const deletionChannelRequest = db.prepare("DELETE FROM xp_channels WHERE guild_id = ? AND channel_id = ?")

    for (const row of channelsRows) {
        if (guild.channels.cache.array().find(currentChannel => currentChannel.id === row.channel_id) === undefined) {
            deletionChannelRequest.run(guild.id, row.channel_id)
        }
    }
}

module.exports = removeDeletedChannels;