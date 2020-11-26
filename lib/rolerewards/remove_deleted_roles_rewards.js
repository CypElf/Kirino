async function removeDeletedRolesRewards(db, guild) {
    const roleRequest = db.prepare("SELECT * FROM xp_roles WHERE guild_id = ?")
    let rolesRows = roleRequest.all(guild.id)

    for (const row of rolesRows) {
        const role = await guild.roles.fetch(row.role_id)
        if (role === undefined) db.prepare("DELETE FROM xp_roles WHERE guild_id = ? AND role_id = ?").run(guild.id, row.role_id)
    }
}

module.exports = removeDeletedRolesRewards;