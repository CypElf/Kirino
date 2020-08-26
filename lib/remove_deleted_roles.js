function removeDeletedRoles(db, guild) {
    const roleRequest = db.prepare("SELECT * FROM xp_roles WHERE guild_id = ?")
    let rolesRows = roleRequest.all(guild.id)

    const deletionRoleRequest = db.prepare("DELETE FROM xp_roles WHERE guild_id = ? AND role_id = ?")

    for (const row of rolesRows) {
        if (guild.roles.cache.array().find(currentRole => currentRole.id === row.role_id) === undefined) {
            deletionRoleRequest.run(guild.id, row.role_id)
        }
    }
}

module.exports = removeDeletedRoles;