function updateBackground(db, msg, background) {
    const userRowRequest = db.prepare("SELECT xp, total_xp, level FROM xp_profiles WHERE guild_id = ? AND user_id = ?")
    const userRow = userRowRequest.get(msg.guild.id, msg.author.id)
    const backgroundRequest = db.prepare("INSERT INTO xp_profiles(guild_id, user_id, xp, total_xp, level, background) VALUES(?,?,?,?,?,?) ON CONFLICT(guild_id, user_id) DO UPDATE SET background=excluded.background")
    backgroundRequest.run(msg.guild.id, msg.author.id, userRow.xp, userRow.total_xp, userRow.level, background)
}

module.exports = updateBackground;