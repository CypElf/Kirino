module.exports = {
	name: 'rule18',
    description: "Affiche la règle 18 du règlement de Avdray.",
    guildOnly: false,
    args: false,
    aliases: ["r18"],
    category: "admin",
	
    async execute(bot, msg) {
        const Discord = require('discord.js');
        const avdray = bot.guilds.find(g => g.id === bot.config.avdrayID);
        const emb = new Discord.RichEmbed()
			.addField("Règle 18", "Merci de ne pas écrire n'importe comment de façon à contourner l'effacement des mots bloqués.")
            .setColor('#000000');
            
            if (avdray != null) {
                emb.setFooter("Règlement de " + avdray.name, avdray.iconURL);
            }
			
		msg.channel.send(emb);
    }
};