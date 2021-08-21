const resetJoin = require("../lib/joins_leaves/reset_leave")

module.exports = bot => {
    bot.on("guildMemberAdd", async member => {
        const { joins_channel_id, join_message } = bot.db.prepare("SELECT joins_channel_id, join_message FROM joins_leaves WHERE guild_id = ?").get(member.guild.id)

        if (joins_channel_id) {
            try {
                const channel = await member.guild.channels.fetch(joins_channel_id)
                const formatted = formatJoinLeaveMessage(join_message, member)

                channel.send(formatted)
            }
            catch {
                resetJoin(db, member.guild.id)
            }
        }
    })
}