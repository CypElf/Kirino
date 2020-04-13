const Discord = require("discord.js");

module.exports = {
	name: 'donation',
    description: 'Envoie le lien PayPal de mon créateur',
    guildOnly: false,
	args: false,
	aliases: ["don"],
	category: "others",
	
	async execute(bot, msg) {
		const emb = new Discord.MessageEmbed()
			.addField("Faire un don", "Si vous voulez soutenir mon créateur, vous pouvez lui [faire un don](https://www.paypal.me/cypelf).")
			.setColor('#DFC900')
			.setThumbnail("https://cdn.discordapp.com/attachments/689424377770541071/699210423290953838/Logo.jpg")
			.setFooter("Requête de " + msg.author.username, msg.author.displayAvatarURL());
		msg.channel.send(emb);
	}
};