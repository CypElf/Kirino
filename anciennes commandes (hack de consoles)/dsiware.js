module.exports = {
	name: 'dsiware',
    description: "Explique ce qu'il faut faire quand le dossier Nintendo DSiWare n'est pas présent au bon endroit.",
    guildOnly: false,
    args: false,
    category: "hack",
	
	async execute(bot, msg) {
        const Discord = require('discord.js');
        const emb = new Discord.RichEmbed()
			.addField("Dossier `Nintendo DSiWare` manquant", "Si le dossier `Nintendo DSiWare` devant se trouver dans `:SD/Nintendo 3DS/ID0/ID1/` n'existe pas, vous avez juste à le créer en faisant un nouveau dossier et en le renommant `Nintendo DSiWare`.")
			.setColor('#DFC900')
			.setFooter("Requête de " + msg.author.username, msg.author.avatarURL);
		msg.channel.send(emb);
		if (msg.channel.type == "text") {
			msg.delete();
        }
	}
};