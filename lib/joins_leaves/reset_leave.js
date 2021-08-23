// return false when there was already nothing set, otherwise return true
function resetLeave(db, guild_id) {
    const leaveRow = db.prepare("SELECT leaves_channel_id, join_message, leave_message FROM joins_leaves WHERE guild_id = ?").get(guild_id)
    if (leaveRow === undefined || leaveRow.leave_message === null) return false

    if (leaveRow.join_message === null) {
        db.prepare("DELETE FROM joins_leaves WHERE guild_id = ?").run(guild_id)
    }
    else {
        db.prepare("UPDATE joins_leaves SET leaves_channel_id = ?, leave_message = ? WHERE guild_id = ?").run(null, null, guild_id)
    }

    return true
}

module.exports = resetLeave