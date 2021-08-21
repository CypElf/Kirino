const resetLeave = require("../lib/joins_leaves/reset_leave")

module.exports = bot => {
    bot.on("guildMemberRemove", async member => {
        const { leaves_channel_id, leave_message } = bot.db.prepare("SELECT leaves_channel_id, leave_message FROM joins_leaves WHERE guild_id = ?").get(member.guild.id)

        if (leaves_channel_id) {
            try {
                const channel = await member.guild.channels.fetch(leaves_channel_id)
                const formatted = formatJoinLeaveMessage(leave_message, member)

                channel.send(formatted)
            }
            catch {
                resetLeave(db, member.guild.id)
            }
        }
    })
}