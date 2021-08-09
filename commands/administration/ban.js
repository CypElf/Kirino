module.exports = {
	name: "ban",
    guildOnly: true,
    args: true,
    cooldown: 3,
    permissions: ["ban members"],

    async execute (bot, msg, [userToBan, ...reason]) {
        if (!msg.member.hasPermission("BAN_MEMBERS")) {
            return msg.channel.send(`${__("you_are_missing_permissions_to_ban_members")} ${__("kirino_pff")}`)
        }
    
        if (!msg.guild.me.hasPermission("BAN_MEMBERS")) {
            return msg.channel.send(`${__("i_am_missing_permissions_to_ban_members")} ${__("kirino_pout")}`)
        }

        function ban(banMember, guildMemberOrUser=true) { // true = GuildMember, false = User
            msg.guild.members.ban(banMember, { reason: reason.join(" ") + " (" + __("banned_by") + msg.author.tag + ")" })
                .then(member => {
                    if (guildMemberOrUser) {
                        msg.channel.send(`${member.user.username + __("has_been_banned")} <:hammer:568068459485855752>`)
                    }
                    else {
                        msg.channel.send(`${member.username + __("has_been_banned")} <:hammer:568068459485855752>`)
                    }
                    msg.delete().catch(() => {})
                })
        }

        const getMember = require("../../lib/getters/get_member")
        let banMember = getMember(msg, args)

        if (banMember === undefined) {
            return msg.channel.send(`${__("please_correctly_write_or_mention_a_member")} ${__("kirino_pout")}`)
        }

        if (!banMember.bannable) {
            return msg.channel.send(`${__("unable_to_ban_higher_than_me")} ${__("kirino_pout")}`)
        }
    
        if (banMember.id === msg.member.id) {
            return msg.channel.send(`${__("cannot_ban_yourself")} ${__("kirino_pff")}`)
        }

        if (msg.member.roles.highest.comparePositionTo(banMember.roles.highest) < 0) {
            return msg.channel.send(`${__("you_cannot_ban_this_member")} ${__("kirino_pff")}`)
        }

        ban(banMember)
    }
}