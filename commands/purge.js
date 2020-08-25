module.exports = {
	name: "purge",
    description: "description_purge",
    guildOnly: true,
	args: true,
	category: "admin",
	usage: "usage_purge",
	aliases: ["clear"],
	permissions: ["manage messages"],
	
	async execute(bot, msg, args) {
		const config = require("../config.json")

		if (!msg.member.hasPermission("MANAGE_MESSAGES") && msg.author.id != config.ownerID) {
			return msg.channel.send(`${__("you_cannot_delete_messages")} ${__("kirino_pff")}`)
		}

		const count = parseInt(args[0]) + 1
		if (isNaN(count)) {
			return msg.channel.send(`${__("please_insert_only_a_number")} ${__("kirino_pout")}`)
		}
		
		msg.channel.bulkDelete(parseInt(args[0]) + 1)
			.catch(() => {
				return msg.channel.send(`${__("purge_does_not_work_beyond_14_days")} ${__("kirino_pout")}`)
			})
	}
}