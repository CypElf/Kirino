module.exports = {
	name: 'rule7',
    description: "Affiche la règle 7 du règlement de Avdray.",
    guildOnly: false,
    args: false,
    aliases: ["r7"],
    category: "admin",
	
    async execute(bot, msg) {
        const Discord = require('discord.js');
        const avdray = bot.guilds.find(g => g.id === bot.config.avdrayID);
        const emb = new Discord.RichEmbed()
			.addField("Règle 7", "Pas de contenu pornographique hors de <#445281835476451348>, de spoil, de contenu haineux, incitant à la haine, etc.")
            .setColor('#000000');
            
            if (avdray != null) {
                emb.setFooter("Règlement de " + avdray.name, avdray.iconURL);
            }
			
		msg.channel.send(emb);
    }
};