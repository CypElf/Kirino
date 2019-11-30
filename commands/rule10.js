module.exports = {
	name: 'rule10',
    description: "Affiche la règle 10 du règlement de Avdray.",
    guildOnly: false,
    args: false,
    aliases: ["r10"],
    category: "admin",
	
    async execute(bot, msg) {
        const Discord = require('discord.js');
        const avdray = bot.guilds.find(g => g.id === bot.config.avdrayID);
        const emb = new Discord.RichEmbed()
			.addField("Règle 10", "Le staff se réserve le droit de sanctionner lourdement les personnes ayant une attitude jugée incorrecte et/ou nuisant au serveur.")
            .setColor('#000000');
            
            if (avdray != null) {
                emb.setFooter("Règlement de " + avdray.name, avdray.iconURL);
            }
			
		msg.channel.send(emb);
    }
};