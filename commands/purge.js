const config = require("../config.json");

module.exports = {
	name: 'purge',
    description: 'Supprime le nombre de messages voulus',
    guildOnly: true,
	args: true,
	category: "admin",
	usage: "[nombre de messages à supprimer]",
	
	async execute(bot, msg, args) {
		if (!msg.member.hasPermission('MANAGE_MESSAGES') && msg.author.id != config.ownerID) {
			return msg.channel.send("Vous ne pouvez pas supprimer de messages ! <:kirinopff:698922942268047391>");
		}
		
		try {
			msg.channel.bulkDelete(parseInt(args[0], 10) + 1)
		}
		catch (err) {
			msg.channel.send("Veuillez saisir un nombre entier uniquement. <:kirinopout:698923065773522944>");
		}
	}
};