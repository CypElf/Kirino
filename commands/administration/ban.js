const { Permissions } = require("discord.js")
const getMember = require("../../lib/getters/get_member")

module.exports = {
    name: "ban",
    guildOnly: true,
    args: true,
    cooldown: 3,
    permissions: ["ban members"],

    async execute(bot, msg, [userToBan, ...reason]) {
        if (!msg.member.permissions.has(Permissions.FLAGS.BAN_MEMBERS)) {
            return msg.channel.send(`${__("you_are_missing_permissions_to_ban_members")} ${__("kirino_pff")}`)
        }

        if (!msg.guild.me.permissions.has(Permissions.FLAGS.BAN_MEMBERS)) {
            return msg.channel.send(`${__("i_am_missing_permissions_to_ban_members")} ${__("kirino_pout")}`)
        }

        function ban(banMember) {
            reason = reason.length > 0 ? reason.join(" ") : __("no_ban_reason")
            msg.guild.members.ban(banMember, { reason: reason + " (" + __("banned_by") + " " + msg.author.tag + ")" })
                .then(member => {
                    if (member.user.username) {
                        msg.channel.send(`${member.user.username + __("has_been_banned")} <:hammer:568068459485855752>`)
                    }
                    else {
                        msg.channel.send(`${member.username + __("has_been_banned")} <:hammer:568068459485855752>`)
                    }
                    msg.delete().catch()
                })
        }

        const banMember = await getMember(msg, [userToBan, ...reason])

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