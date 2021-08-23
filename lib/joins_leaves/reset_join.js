// return false when there was already nothing set, otherwise return true
function resetJoin(db, guild_id) {
    const joinRow = db.prepare("SELECT joins_channel_id, join_message, leave_message FROM joins_leaves WHERE guild_id = ?").get(guild_id)
    if (joinRow === undefined || joinRow.join_message === null) return false

    if (joinRow.leave_message === null) {
        db.prepare("DELETE FROM joins_leaves WHERE guild_id = ?").run(guild_id)
    }
    else {
        db.prepare("UPDATE joins_leaves SET joins_channel_id = ?, join_message = ? WHERE guild_id = ?").run(null, null, guild_id)
    }

    return true
}

module.exports = resetJoin