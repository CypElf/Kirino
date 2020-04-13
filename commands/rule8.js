module.exports = {
	name: 'rule8',
    description: "Affiche la règle 8 du règlement de Avdray.",
    guildOnly: false,
    args: false,
    aliases: ["r8"],
    category: "admin",
	
    async execute(bot, msg) {
        const Discord = require('discord.js');
        const avdray = bot.guilds.cache.find(g => g.id === bot.config.avdrayID);
        const emb = new Discord.MessageEmbed()
			.addField("Règle 8", "Ne ramenez pas de double compte. Un seul compte par utilisateur sur le serveur suffit.")
            .setColor('#000000');
            
            if (avdray != null) {
                emb.setFooter("Règlement de " + avdray.name, avdray.iconURL());
            }
			
		msg.channel.send(emb);
    }
};