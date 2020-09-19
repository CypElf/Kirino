module.exports = {
	name: "profilepicture",
    description: "description_profilepicture",
    guildOnly: true,
    args: false,
    aliases: ["pp", "avatar"],
    category: "utility",
    usage: "usage_profilepicture",

    async execute (bot, msg, args) {
        let member

        if (!args.length) member = msg.member

        else {
            const getUser = require("../lib/get_user")

            member = await getUser(msg, args)
            
            if (member === undefined) return msg.channel.send(`${__("please_correctly_write_or_mention_a_member")} ${__("kirino_pout")}`)
        }

        msg.channel.send(member.user.displayAvatarURL({
            dynamic: true,
            size: 2048
        }))
    }
}