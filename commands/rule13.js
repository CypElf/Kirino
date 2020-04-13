module.exports = {
	name: 'rule13',
    description: "Affiche la règle 13 du règlement de Avdray.",
    guildOnly: false,
    args: false,
    aliases: ["r13"],
    category: "admin",
	
    async execute(bot, msg) {
        const Discord = require('discord.js');
        const avdray = bot.guilds.cache.find(g => g.id === bot.config.avdrayID);
        const emb = new Discord.MessageEmbed()
			.addField("Règle 13", "Évitez de parler d'affaires extérieures, liées à d'autres serveurs notamment, sur ce serveur. Elles ne nous regardent pas.")
            .setColor('#000000');
            
            if (avdray != null) {
                emb.setFooter("Règlement de " + avdray.name, avdray.iconURL());
            }
			
		msg.channel.send(emb);
    }
};