module.exports = {
	name: "kick",
    description: "description_kick",
    guildOnly: true,
    args: true,
    cooldown: 3,
    category: "admin",
    usage: "usage_kick",
    permissions: ["kick members"],

    async execute (bot, msg, [userToKick, ...reason]) {
        if (!msg.member.hasPermission("KICK_MEMBERS")) {
            return msg.channel.send(__("you_are_missing_permissions_to_kick_members") + " <:kirinopff:698922942268047391>")
        }
    
        if (!msg.guild.me.hasPermission("KICK_MEMBERS")) {
            return msg.channel.send(__("i_am_missing_permissions_to_kick_members") + " <:kirinopout:698923065773522944>")
        }

        let kickMember = msg.mentions.members.first()

        if (kickMember === undefined) {
            kickMember = msg.guild.members.cache.array().find(currentUser => currentUser.user.username.toLowerCase() === userToKick.toLowerCase())
            if (kickMember === undefined) {
                try { 
                    kickMember = await msg.guild.members.fetch(userToKick)
                }
                catch (err) {
                    return msg.channel.send(__("please_correctly_write_or_mention_a_member") + " <:kirinopout:698923065773522944>")
                }
            }
        }

        if (!kickMember.kickable) {
            return msg.channel.send(__("unable_to_kick_higher_than_me") + " <:kirinopout:698923065773522944>")
        }
    
        if (kickMember.id === msg.member.id) {
            return msg.channel.send(__("cannot_kick_yourself") + " <:kirinopff:698922942268047391>")
        }

        if (msg.member.roles.highest.comparePositionTo(kickMember.roles.highest) < 0) {
            return msg.channel.send(__("you_cannot_kick_this_member") + " <:kirinopff:698922942268047391>")
        }

        kickMember.kick({ reason: reason.join(" ") + " (" + __("kicked_by") + msg.author.tag + ")" })
            .then(member => {
                msg.channel.send(member.user.username + __("has_been_kicked") + " <:boot:568041855523094549>")

                msg.delete().catch(() => {})
            })
    }
}