import { Database } from "better-sqlite3"
import { JoinLeave } from "../misc/database"

// return false when there was already nothing set, otherwise return true
export default function resetLeave(db: Database, guild_id: string) {
    const leaveRow = db.prepare("SELECT leaves_channel_id, join_message, leave_message FROM joins_leaves WHERE guild_id = ?").get(guild_id) as JoinLeave | undefined
    if (leaveRow === undefined || leaveRow.leave_message === undefined) return false

    if (leaveRow.join_message === undefined) {
        db.prepare("DELETE FROM joins_leaves WHERE guild_id = ?").run(guild_id)
    }
    else {
        db.prepare("UPDATE joins_leaves SET leaves_channel_id = ?, leave_message = ? WHERE guild_id = ?").run(null, null, guild_id)
    }

    return true
}