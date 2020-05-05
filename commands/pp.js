module.exports = {
	name: "pp",
    description: "description_pp",
    guildOnly: true,
    args: false,
    category: "utility",
    usage: "usage_pp",

    async execute (bot, msg, args) {
        let member

        if (!args.length) member = msg.member

        else {
            member = msg.mentions.members.first()
            if (member === undefined) {
                let usernameOrID = args.join(" ")
                member = msg.guild.members.cache.array().find(currentMember => currentMember.user.username.toLowerCase() === usernameOrID.toLowerCase())
                if (member === undefined) {
                    member = msg.guild.members.cache.array().find(currentMember => currentMember.id === usernameOrID)
                    if (member === undefined) {
                        return msg.channel.send(__("please_correctly_write_or_mention_a_member") + " <:kirinopout:698923065773522944>")
                    }
                }
            }
        }

        msg.channel.send({
            files: [{
                attachment: member.user.displayAvatarURL() + "?size=2048",
                name: "avatar.png"
            }]
        })
    }
}