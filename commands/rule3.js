module.exports = {
	name: 'rule3',
    description: "Affiche la règle 3 du règlement de Avdray.",
    guildOnly: false,
    args: false,
    aliases: ["r3"],
    category: "admin",
	
    async execute(bot, msg) {
        const Discord = require('discord.js');
        const avdray = bot.guilds.find(g => g.id === bot.config.avdrayID);
        const emb = new Discord.RichEmbed()
			.addField("Règle 3", "Ne mentionnez pas des gens inutilement.")
            .setColor('#000000');
            
            if (avdray != null) {
                emb.setFooter("Règlement de " + avdray.name, avdray.iconURL);
            }
			
		msg.channel.send(emb);
    }
};