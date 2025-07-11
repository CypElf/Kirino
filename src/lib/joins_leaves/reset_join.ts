import { Database } from "bun:sqlite"
import { JoinLeave } from "../misc/database"

// return false when there was already nothing set, otherwise return true
export default function resetJoin(db: Database, guild_id: string) {
    const joinRow = db.prepare("SELECT joins_channel_id, join_message, leave_message FROM joins_leaves WHERE guild_id = ?").get(guild_id) as JoinLeave | null
    if (!joinRow || !joinRow.join_message) return false

    if (!joinRow.leave_message) {
        db.prepare("DELETE FROM joins_leaves WHERE guild_id = ?").run(guild_id)
    }
    else {
        db.prepare("UPDATE joins_leaves SET joins_channel_id = ?, join_message = ? WHERE guild_id = ?").run(null, null, guild_id)
    }

    return true
}