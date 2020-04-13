module.exports = {
	name: 'rule11',
    description: "Affiche la règle 11 du règlement de Avdray.",
    guildOnly: false,
    args: false,
    aliases: ["r11"],
    category: "admin",
	
    async execute(bot, msg) {
        const Discord = require('discord.js');
        const avdray = bot.guilds.cache.find(g => g.id === bot.config.avdrayID);
        const emb = new Discord.MessageEmbed()
			.addField("Règle 11", "Interdictions de créer, relancer ou parler de dramas.")
            .setColor('#000000');
            
            if (avdray != null) {
                emb.setFooter("Règlement de " + avdray.name, avdray.iconURL());
            }
			
		msg.channel.send(emb);
    }
};