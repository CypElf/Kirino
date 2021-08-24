const resetLeave = require("../lib/joins_leaves/reset_leave")
const formatJoinLeaveMessage = require("../lib/joins_leaves/format_join_leave_message")

module.exports = bot => {
    bot.on("guildMemberRemove", async member => {
        const row = bot.db.prepare("SELECT leaves_channel_id, leave_message FROM joins_leaves WHERE guild_id = ?").get(member.guild.id)

        if (row.leaves_channel_id) {
            try {
                const channel = await member.guild.channels.fetch(row.leaves_channel_id)
                const formatted = formatJoinLeaveMessage(row.leave_message, member)

                channel.send(formatted)
            }
            catch {
                resetLeave(bot.db, member.guild.id)
            }
        }
    })
}