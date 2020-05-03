module.exports = {
	name: "ban",
    description: "description_ban",
    guildOnly: true,
    args: true,
    category: "admin",
    usage: "usage_ban",

    async execute (bot, msg, [userToBan, ...reason]) {
        if (!msg.member.hasPermission('BAN_MEMBERS')) {
            return msg.channel.send(__("you_are_missing_permissions_to_ban_members") + " <:kirinopff:698922942268047391>")
        }
    
        if (!msg.guild.me.hasPermission('BAN_MEMBERS')) {
            return msg.channel.send(__("i_am_missing_permissions_to_ban_members") + " <:kirinopout:698923065773522944>")
        }
    
        let banMember = msg.mentions.members.first()
        if (!banMember) {
            banMember = msg.guild.members.cache.array().find((currentUser) => {
                return currentUser.user.username.toLowerCase() === userToBan.toLowerCase()
            })
            if (banMember === undefined) {
                return msg.channel.send(__("please_correctly_write_or_mention_a_member") + " <:kirinopout:698923065773522944>")
            }
        }
    
        if (!banMember.bannable) {
            return msg.channel.send(__("unable_to_ban_higher_than_me") + " <:kirinopout:698923065773522944>")
        }
    
        if (banMember.id === msg.member.id) {
            return msg.channel.send(__("cannot_ban_yourself") + " <:kirinopff:698922942268047391>")
        }
    
        if (msg.member.roles.highest.comparePositionTo(banMember.roles.highest) < 0) {
            return msg.channel.send(__("you_cannot_ban_this_member") + " <:kirinopff:698922942268047391>")
        }
    
        banMember.ban({ reason: reason.join(" ") + " (" + __("banned_by") + msg.author.tag + ")" })
            .then(member => {
                msg.channel.send(member.user.username + __("has_been_banned") + " <:hammer:568068459485855752>")
                msg.delete()
            })
    }
}