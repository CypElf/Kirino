function updateBackground(db, backgroundLink, user_id, guild_id) {
    const userRow = db.prepare("SELECT xp, total_xp, level FROM xp_profiles WHERE guild_id = ? AND user_id = ?").get(guild_id, user_id)
    if (userRow.xp === undefined) userRow.xp = 0
    if (userRow.total_xp === undefined) userRow.total_xp = 0
    if (userRow.level === undefined) userRow.level = 0
    db.prepare("INSERT INTO xp_profiles(guild_id, user_id, xp, total_xp, level, background) VALUES(?,?,?,?,?,?) ON CONFLICT(guild_id, user_id) DO UPDATE SET background=excluded.background").run(guild_id, user_id, userRow.xp, userRow.total_xp, userRow.level, backgroundLink)
}

module.exports = updateBackground