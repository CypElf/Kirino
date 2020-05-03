module.exports = {
	name: "edit",
    description: "edit_description",
    guildOnly: true,
	args: true,
	category: "others",
	usage: "edit_usage",
	
	async execute(bot, msg, [ID, ...editMsg]) {
		if (msg.author.id !== bot.config.ownerID && msg.author.id !== msg.guild.ownerID) {
            return msg.channel.send(__("not_allowed_to_use_this_command") + " <:kirinopff:698922942268047391>")
                .then(msg => msg.delete({ timeout: 5000 }))
                .catch()
        }

		msg.channel.messages.fetch(ID)
			.then(msg2 => {
				if (!msg2.editable) {
					return msg.channel.send(__("cannot_edit_this_message") + " <:kirinopff:698922942268047391>")
				}
				const replacementText = editMsg.join(" ")
				if (!replacementText) return msg.channel.send(__("precise_something_to_replace") + " <:kirinopout:698923065773522944>")
				msg2.edit(replacementText)
					.catch()

				msg.delete()
			})
			.catch(err => {
				return msg.channel.send(__("bad_message_id") + " <:kirinopout:698923065773522944>")
			})
	}
}
