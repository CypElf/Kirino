const Discord = require("discord.js");

module.exports = {
	name: 'donation',
    description: 'Envoie le lien PayPal de mon créateur',
    guildOnly: false,
	args: false,
	category: "others",
	
	async execute(bot, msg) {
		const emb = new Discord.RichEmbed()
			.addField("Faire un don", "Si vous voulez soutenir mon créateur, vous pouvez lui [faire un don](https://www.paypal.me/cypelf).")
			.setColor('#DFC900')
			.setThumbnail("https://cdn.glitch.com/95815403-f1a3-4b7b-8652-5976c8dec4c1%2FLogo.jpg?v=1555505591268")
			.setFooter("Requête de " + msg.author.username, msg.author.avatarURL);
		msg.channel.send(emb);
	}
};