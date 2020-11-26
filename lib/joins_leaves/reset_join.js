// return false when there was already nothing set, else true
function resetJoin(db, guild_id) {
    const currentJoinRequest = db.prepare("SELECT joins_channel_id, join_message, leave_message FROM joins_leaves WHERE guild_id = ?")
    const joinRow = currentJoinRequest.get(guild_id)

    if (joinRow === undefined || joinRow.join_message === null) return false

    if (joinRow.leave_message === null) {
        const resetRequest = db.prepare("DELETE FROM joins_leaves WHERE guild_id = ?")
        resetRequest.run(guild_id)
    }
    else {
        const resetRequest = db.prepare("INSERT INTO joins_leaves(guild_id, joins_channel_id, join_message) VALUES(?,?,?) ON CONFLICT(guild_id) DO UPDATE SET joins_channel_id=excluded.joins_channel_id, join_message=excluded.join_message")
        resetRequest.run(guild_id, null, null)
    }

    return true
}

module.exports = resetJoin