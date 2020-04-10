module.exports = {
	name: 'invit',
    description: 'Envoie le lien permettant de m\'inviter dans un serveur.',
    guildOnly: false,
	args: false,
	category: "others",
	
	async execute(bot, msg) {
		const Discord = require('discord.js');
        const emb = new Discord.RichEmbed()
			.addField("Inviter le bot **Kirino** sur un serveur", "Le lien permettant de m'inviter sur un serveur est disponible **[ici](https://discordapp.com/oauth2/authorize?client_id=493470054415859713&scope=bot&permissions=8)**")
			.setColor('#DFC900')
			.setFooter("Requête de " + msg.author.username, msg.author.avatarURL);
		msg.channel.send(emb);
	}
};