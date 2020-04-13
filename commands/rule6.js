module.exports = {
	name: 'rule6',
    description: "Affiche la règle 6 du règlement de Avdray.",
    guildOnly: false,
    args: false,
    aliases: ["r6"],
    category: "admin",
	
    async execute(bot, msg) {
        const Discord = require('discord.js');
        const avdray = bot.guilds.cache.find(g => g.id === bot.config.avdrayID);
        const emb = new Discord.MessageEmbed()
			.addField("Règle 6", "N'usurpez pas l'identité de quelqu'un en mettant la même photo de profil et / ou le même pseudo.")
            .setColor('#000000');
            
            if (avdray != null) {
                emb.setFooter("Règlement de " + avdray.name, avdray.iconURL());
            }
			
		msg.channel.send(emb);
    }
};