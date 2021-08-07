module.exports = {
	name: "edit",
    guildOnly: true,
	args: true,
	permissions: ["administrator"],
	
	async execute(bot, msg, [ID, ...editMsg]) {
		if (msg.author.id !== process.env.OWNER_ID && !msg.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
            return msg.channel.send(__("not_allowed_to_use_this_command") + " " + __("kirino_pff"))
                .then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000))
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