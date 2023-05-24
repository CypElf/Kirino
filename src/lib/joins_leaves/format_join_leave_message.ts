import { GuildMember, PartialGuildMember } from "discord.js"

export default function formatJoinLeaveMessage(message: string, member: GuildMember | PartialGuildMember) {
    return message
        .replace("{user}", `<@${member.id}>`)
        .replace("{username}", member.user.username)
        .replace("{tag}", member.user.tag)
        .replace("{server}", member.guild.name)
        .replace("{count}", member.guild.memberCount.toString())
}