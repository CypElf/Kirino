const resetJoin = require("../lib/joins_leaves/reset_leave")
const formatJoinLeaveMessage = require("../lib/joins_leaves/format_join_leave_message")

module.exports = bot => {
    bot.on("guildMemberAdd", async member => {
        const row = bot.db.prepare("SELECT joins_channel_id, join_message FROM joins_leaves WHERE guild_id = ?").get(member.guild.id)

        if (row) {
            // try {
                const channel = await member.guild.channels.fetch(row.joins_channel_id)
                const formatted = formatJoinLeaveMessage(row.join_message, member)

                channel.send(formatted)
            // }
            // catch {
            //     resetJoin(bot.db, member.guild.id)
            // }
        }
    })
}