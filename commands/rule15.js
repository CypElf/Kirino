module.exports = {
	name: 'rule15',
    description: "Affiche la règle 15 du règlement de Avdray.",
    guildOnly: false,
    args: false,
    aliases: ["r15"],
    category: "admin",
	
    async execute(bot, msg) {
        const Discord = require('discord.js');
        const avdray = bot.guilds.find(g => g.id === bot.config.avdrayID);
        const emb = new Discord.RichEmbed()
			.addField("Règle 15", "N'aidez pas les gens en hack 3ds sans le rôle Aide en hack 3ds. Sans les connaissances nécessaires, vous pourriez causer encore plus de problèmes.")
            .setColor('#000000');
            
            if (avdray != null) {
                emb.setFooter("Règlement de " + avdray.name, avdray.iconURL);
            }
			
		msg.channel.send(emb);
    }
};