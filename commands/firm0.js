module.exports = {
	name: 'firm0',
    description: 'Explique comment installer boot9strap après avoir corrompu le firm0.',
    guildOnly: false,
    args: false,
    category: "hack",
    
    async execute(bot, msg) {
        const Discord = require('discord.js');
        const emb = new Discord.RichEmbed()
			.addField("Firm0 corrompu", "1. Allumez votre console et allez dans `Paramètres / Autres paramètres`, puis naviguez jusqu'à la 4ème page, et enfin allez dans `Mise à jour`. Continuez de valider pour faire une vérification de mise à jour, puis une mise à jour si disponible (même si aucune mise à jour n'est disponible, cette étape est importante).\n2. Allez dans `Paramètres / Paramètres Internet / Connexions Nintendo DS`. Vous arriverez dans Flipnote Studio (en japonais). Vous pouvez maintenant continuer à nouveau la vidéo à partir de [ce moment](https://youtu.be/WEf6iHtalDI?t=717).")
			.setColor('#DFC900')
			.setFooter("Requête de " + msg.author.username, msg.author.avatarURL);
		msg.channel.send(emb);
		if (msg.channel.type == "text") {
			msg.delete();
        }
    }
};