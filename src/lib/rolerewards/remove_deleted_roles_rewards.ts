import { Guild } from "discord.js"
import { Database } from "better-sqlite3"
import { Role } from "../misc/database"

export default async function removeDeletedRolesRewards(db: Database, guild: Guild) {
    const roleRequest = db.prepare("SELECT * FROM xp_roles WHERE guild_id = ?")
    const rolesRows = roleRequest.all(guild.id) as Role[]

    for (const row of rolesRows) {
        const role = await guild.roles.fetch(row.role_id)
        if (role === undefined) db.prepare("DELETE FROM xp_roles WHERE guild_id = ? AND role_id = ?").run(guild.id, row.role_id)
    }
}