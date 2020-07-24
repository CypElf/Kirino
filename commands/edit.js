module.exports = {
	name: "edit",
    description: "edit_description",
    guildOnly: true,
	args: true,
	category: "admin",
	usage: "edit_usage",
	permissions: ["administrator"],
	
	async execute(bot, msg, [ID, ...editMsg]) {
		if (msg.author.id !== bot.config.ownerID && !msg.member.hasPermission("ADMINISTRATOR")) {
            return msg.channel.send(__("not_allowed_to_use_this_command") + " " + __("kirino_pff"))
                .then(msg => msg.delete({ timeout: 5000 })).catch(() => {})
                .catch(() => {})
        }

		msg.channel.messages.fetch(ID)
			.then(msg2 => {
				if (!msg2.editable) {
					return msg.channel.send(`${__("cannot_edit_this_message")} ${__("kirino_pff")}`)
				}
				const replacementText = editMsg.join(" ")
				if (!replacementText) return msg.channel.send(`${__("precise_something_to_replace")} ${__("kirino_pout")}`)
				msg2.edit(replacementText)
					.catch()

				msg.delete().catch(() => {})
			})
			.catch(err => {
				return msg.channel.send(`${__("bad_message_id")} ${__("kirino_pout")}`)
			})
	}
}
