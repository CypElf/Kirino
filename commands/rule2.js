module.exports = {
	name: 'rule2',
    description: "Affiche la règle 2 du règlement de Avdray.",
    guildOnly: false,
    args: false,
    aliases: ["r2"],
    category: "admin",
	
    async execute(bot, msg) {
        const Discord = require('discord.js');
        const avdray = bot.guilds.find(g => g.id === bot.config.avdrayID);
        const emb = new Discord.MessageEmbed()
			.addField("Règle 2", "Toute forme de pub est strictement interdite, **MP compris**, sauf exception autorisée après demande.")
            .setColor('#000000');
            
            if (avdray != null) {
                emb.setFooter("Règlement de " + avdray.name, avdray.iconURL);
            }
			
		msg.channel.send(emb);
    }
};