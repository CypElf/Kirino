const Discord = require("discord.js");

module.exports = {
	name: 'sd',
    description: 'Donne les instructions à suivre pour changer la carte SD de sa 3DS par une nouvelle de plus de 32 Go.',
    guildOnly: false,
	args: false,
	category: "hack",
	
	async execute(bot, msg) {
		const emb = new Discord.RichEmbed()
			.addField("Migrer vers une carte SD de plus de 32 Go", "Pour changer la carte SD de sa 3DS avec une nouvelle de plus de 32 Go, vous devez tout d'abord la formater en **FAT32** (avec une taille de cluster de 32 Ko (celle par défaut)) avec, sous Windows, le logiciel **[guiformat](http://www.ridgecrop.demon.co.uk/guiformat.exe)**.\nUne fois fait, vous n'aurez plus qu'à déplacer les fichiers de l'ancienne carte SD vers la nouvelle.")
			.setColor('#DFC900')
			.setFooter("Requête de " + msg.author.username, msg.author.avatarURL);
		msg.channel.send(emb);
		if (msg.channel.type == "text") {
			msg.delete();
		}
	}
}
    