const config = require("../config.json")

module.exports = {
	name: "purge",
    description: "description_purge",
    guildOnly: true,
	args: true,
	category: "admin",
	usage: "usage_purge",
	permissions: ["manage messages"],
	
	async execute(bot, msg, args) {
		if (!msg.member.hasPermission("MANAGE_MESSAGES") && msg.author.id != config.ownerID) {
			return msg.channel.send(__("you_cannot_delete_messages") + " <:kirinopff:698922942268047391>")
		}

		const count = parseInt(args[0]) + 1
		if (isNaN(count)) {
			return msg.channel.send(__("please_insert_only_a_number") + " <:kirinopout:698923065773522944>")
		}
		
		msg.channel.bulkDelete(parseInt(args[0]) + 1)
			.catch(() => {
				return msg.channel.send(__("purge_does_not_work_beyond_14_days") + " <:kirinopout:698923065773522944>")
			})
	}
}