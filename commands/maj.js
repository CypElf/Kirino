module.exports = {
	name: 'maj',
    description: 'Explique comment supprimer une mise à jour de jeu 3ds, notamment de Steel Diver: Sub Wars.',
    guildOnly: false,
    args: false,
    category: "hack",
	async execute(bot, msg) {
        const Discord = require('discord.js');
        const emb = new Discord.RichEmbed()
			.addField("Supprimer une mise à jour de logiciel sur 3ds", "Allez dans `paramètres/gestion des données/contenu additionnel/le jeu en question`, puis faites `effacer` et validez.")
			.setColor('#DFC900')
			.setFooter("Requête de " + msg.author.username, msg.author.avatarURL);
		msg.channel.send(emb);
		if (msg.channel.type == "text") {
			msg.delete();
        }
	}
};