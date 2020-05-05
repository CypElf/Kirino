module.exports = {
	name: "react",
    description: "description_react",
    guildOnly: false,
    args: true,
    category: "admin",
    usage: "usage_react",
    permissions: ["administrator"],
    
    async execute(bot, msg, args) {
		if (msg.author.id !== bot.config.ownerID && !msg.member.hasPermission("ADMINISTRATOR")) {
            return msg.channel.send(__("not_allowed_to_use_this_command") + " <:kirinopff:698922942268047391>")
                .then(msg => msg.delete({ timeout: 5000 }))
                .catch()
        }

        if (msg.channel.type === "text") {
            if (!msg.guild.me.hasPermission("ADD_REACTIONS")) return msg.channel.send(__("cannot_react_to_messages") + " <:kirinopout:698923065773522944>")
        }

        if (args.length < 2) {
            return msg.channel.send(__("insert_only_id_and_emoji") + " <:kirinopout:698923065773522944>")
        }

        const ID = args[0]
        const emoji = args[1]

        msg.channel.messages.fetch(ID)
			.then(msg2 => {
                msg2.react(emoji)
                    .then(() => {
                        msg.delete()
                    })
                    .catch(() => {
                        let customEmoji = emoji.match(/<:(.*?):[0-9]*>/gm)
                        if (customEmoji) customEmoji = customEmoji.map(emoji => emoji.split(":")[2].split(">")[0])[0]
                        else customEmoji = "nop"
                        msg2.react(customEmoji)
                            .then(() => {
                                msg.delete()
                            })
                            .catch(() => {
                                return msg.channel.send(__("access_to_emoji_denied") + " <:kirinopout:698923065773522944>")
                            })
                    })
			})
			.catch(err => {
				return msg.channel.send(__("bad_message_id") + " <:kirinopout:698923065773522944>")
			})
    }
}
