module.exports = {
	name: 'rule11',
    description: "Affiche la règle 11 du règlement de Avdray.",
    guildOnly: false,
    args: false,
    aliases: ["r11"],
    category: "admin",
	
    async execute(bot, msg) {
        const Discord = require('discord.js');
        const avdray = bot.guilds.find(g => g.id === bot.config.avdrayID);
        const emb = new Discord.RichEmbed()
			.addField("Règle 11", "Pas de doubles comptes.")
            .setColor('#000000');
            
            if (avdray != null) {
                emb.setFooter("Règlement de " + avdray.name, avdray.iconURL);
            }
			
		msg.channel.send(emb);
    }
};