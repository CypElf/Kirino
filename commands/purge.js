const config = require("../config.json");

module.exports = {
	name: "purge",
    description: "description_purge",
    guildOnly: true,
	args: true,
	category: "admin",
	usage: "usage_purge",
	
	async execute(bot, msg, args) {
		if (!msg.member.hasPermission("MANAGE_MESSAGES") && msg.author.id != config.ownerID) {
			return msg.channel.send(__("you_cannot_delete_messages") + " <:kirinopff:698922942268047391>");
		}
		
		msg.channel.bulkDelete(parseInt(args[0], 10) + 1)
			.catch(err => {
				msg.channel.send(__("please_insert_only_a_number") + " <:kirinopout:698923065773522944>");
			});
	}
};