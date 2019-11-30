module.exports = {
	name: 'r13',
    description: "Affiche la règle 13 du règlement de Avdray.",
    guildOnly: false,
    args: false,
    category: "admin",
	
    async execute(bot, msg) {
        const Discord = require('discord.js');
        const avdray = bot.guilds.find(g => g.id === bot.config.avdrayID);
        const emb = new Discord.RichEmbed()
			.addField("Règle 13", "Une bonne orthographe est demandée, les gens n'écrivant que très mal sont donc priés d'utiliser un correcteur pour que les messages soient au moins compréhensibles. Pas de caps lock.")
            .setColor('#000000');
            
            if (avdray != null) {
                emb.setFooter("Règlement de " + avdray.name, avdray.iconURL);
            }
			
		msg.channel.send(emb);
    }
};