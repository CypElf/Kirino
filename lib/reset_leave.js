// return false when there was already nothing set, else true
function resetLeave(db, guild_id) {
    const currentLeaveRequest = db.prepare("SELECT leaves_channel_id, join_message, leave_message FROM joins_leaves WHERE guild_id = ?")
    const leaveRow = currentLeaveRequest.get(guild_id)

    if (leaveRow === undefined || leaveRow.leave_message === null) return false

    if (leaveRow.join_message === null) {
        const resetRequest = db.prepare("DELETE FROM joins_leaves WHERE guild_id = ?")
        resetRequest.run(guild_id)
    }
    else {
        const resetRequest = db.prepare("INSERT INTO joins_leaves(guild_id, leaves_channel_id, leave_message) VALUES(?,?,?) ON CONFLICT(guild_id) DO UPDATE SET leaves_channel_id=excluded.leaves_channel_id, leave_message=excluded.leave_message")
        resetRequest.run(guild_id, null, null)
    }

    return true
}

module.exports = resetLeave