const config = require("../config.json");

module.exports = {
	name: 'edit',
    description: 'Modifie un de mes messages. Seul le possesseur d\'un serveur peut utiliser cette commande.',
    guildOnly: true,
	args: true,
	category: "others",
	usage: "[ID du message] [nouveau message]",

	async help(bot, msg, helpEmbed) {
		helpEmbed
			.setDescription("Cette commande sert à me faire éditer un de mes messages. Seul le possesseur d'un serveur peut l'utiliser.")
			.addField("Procédure", "Cette commande s'utilise comme ceci : `" + config.prefix + this.name + " " + this.usage + "`");
			msg.channel.send(helpEmbed);
	},
	
	async execute(bot, msg, [ID, ...editMsg]) {
		if (msg.author.id != config.ownerID && msg.author.id !== msg.guild.ownerID) {
			return;
		}
		
		msg.channel.fetchMessage(ID)
			.then(msg2 => {
				if (!msg2.editable) {
					msg.channel.send("Je ne peux pas modifier ce message ! <:warning:568037672770338816>");
				}
				msg2.edit(editMsg.join(" "))
					.catch();
			})
			.catch();
		
		msg.delete();
	}
};
