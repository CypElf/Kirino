import resetJoin from "../lib/joins_leaves/reset_join"
import formatJoinLeaveMessage from "../lib/joins_leaves/format_join_leave_message"
import { Kirino } from "../lib/misc/types"
import { JoinLeave } from "../lib/misc/database"
import { ChannelType, Events } from "discord.js"

export function eventHandler(bot: Kirino) {
    bot.on(Events.GuildMemberAdd, async member => {
        const row = bot.db.prepare("SELECT joins_channel_id, join_message FROM joins_leaves WHERE guild_id = ?").get(member.guild.id) as JoinLeave | undefined

        if (row && row.joins_channel_id && row.join_message) {
            try {
                const channel = await member.guild.channels.fetch(row.joins_channel_id)
                const formatted = formatJoinLeaveMessage(row.join_message, member)

                if (channel && channel.type === ChannelType.GuildText) {
                    await channel.send(formatted)
                }
                else {
                    resetJoin(bot.db, member.guild.id)
                }
            }
            catch {
                resetJoin(bot.db, member.guild.id)
            }
        }
    })
}