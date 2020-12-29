module.exports = {
	name: "profilepicture",
    guildOnly: false,
    args: false,
    aliases: ["pp", "avatar"],
    category: "utility",

    async execute (bot, msg, args) {
        let user

        if (!args.length || !msg.guild) user = msg.author
        else {
            const getMember = require("../lib/getters/get_member")
            user = await getMember(msg, args)
            user = user.user
            
            if (user === undefined) return msg.channel.send(`${__("please_correctly_write_or_mention_a_member")} ${__("kirino_pout")}`)
        }

        msg.channel.send(user.displayAvatarURL({
            dynamic: true,
            size: 4096
        }))
    }
}