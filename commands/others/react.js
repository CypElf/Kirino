module.exports = {
	name: "react",
    guildOnly: false,
    args: true,
    permissions: ["administrator"],
    
    async execute(bot, msg, args) {
		if (msg.author.id !== process.env.OWNER_ID && !msg.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
            return msg.channel.send(`${__("not_allowed_to_use_this_command")} ${__("kirino_pff")}`)
                .then(msg => msg.delete({ timeout: 5000 })).catch(() => {})
        }

        if (msg.guild) {
            if (!msg.guild.me.permissions.has(Permissions.FLAGS.ADD_REACTIONS)) return msg.channel.send(`${__("cannot_react_to_messages")} ${__("kirino_pout")}`)
        }

        if (args.length < 2) {
            return msg.channel.send(`${__("insert_only_id_and_emoji")} ${__("kirino_pout")}`)
        }

        const ID = args[0]
        const emoji = args[1]

        msg.channel.messages.fetch(ID)
			.then(msg2 => {
                msg2.react(emoji)
                    .then(() => {
                        msg.delete().catch(() => {})
                    })
                    .catch(() => {
                        let customEmoji = emoji.match(/<:(.*?):[0-9]*>/gm)
                        if (customEmoji) customEmoji = customEmoji.map(emoji => emoji.split(":")[2].split(">")[0])[0]
                        else customEmoji = "nop"
                        msg2.react(customEmoji)
                            .then(() => {
                                msg.delete().catch(() => {})
                            })
                            .catch(() => {
                                return msg.channel.send(__("access_to_emoji_denied") + " " + __("kirino_pout"))
                            })
                    })
			})
			.catch(err => {
				return msg.channel.send(__("bad_message_id") + " " + __("kirino_pout"))
			})
    }
}
