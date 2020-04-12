const config = require("../config.json");

module.exports = {
	name: 'edit',
    description: 'Modifie un de mes messages. Seul le possesseur d\'un serveur peut utiliser cette commande.',
    guildOnly: true,
	args: true,
	category: "others",
	usage: "[ID du message] [nouveau message]",
	
	async execute(bot, msg, [ID, ...editMsg]) {
		if (msg.author.id != config.ownerID && msg.author.id !== msg.guild.ownerID) {
			return;
		}

		msg.channel.fetchMessage(ID)
			.then(msg2 => {
				if (!msg2.editable) {
					return msg.channel.send("Je ne peux pas modifier ce message ! <:warning:568037672770338816>");
				}
				const replacementText = editMsg.join(" ");
				if (!replacementText) return msg.channel.send("Veuillez préciser quelque chose à mettre dans le message ! <:warning:568037672770338816>")
				msg2.edit(replacementText)
					.catch();

				msg.delete();
			})
			.catch(err => {
				return msg.channel.send("L'ID du message fourni est incorrect ! <:warning:568037672770338816>");
			});
	}
};
