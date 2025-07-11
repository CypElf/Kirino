import resetLeave from "../lib/joins_leaves/reset_leave"
import formatJoinLeaveMessage from "../lib/joins_leaves/format_join_leave_message"
import { Kirino } from "../lib/misc/types"
import { JoinLeave } from "../lib/misc/database"
import { ChannelType, Events } from "discord.js"

export function eventHandler(bot: Kirino) {
    bot.on(Events.GuildMemberRemove, async member => {
        const row = bot.db.prepare("SELECT leaves_channel_id, leave_message FROM joins_leaves WHERE guild_id = ?").get(member.guild.id) as JoinLeave | null

        if (row && row.leaves_channel_id && row.leave_message) {
            try {
                const channel = await member.guild.channels.fetch(row.leaves_channel_id)
                const formatted = formatJoinLeaveMessage(row.leave_message, member)

                if (channel?.type === ChannelType.GuildText) {
                    await channel.send(formatted)
                }
                else {
                    resetLeave(bot.db, member.guild.id)
                }
            }
            catch {
                resetLeave(bot.db, member.guild.id)
            }
        }
    })
}