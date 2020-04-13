module.exports = {
	name: 'rule12',
    description: "Affiche la règle 12 du règlement de Avdray.",
    guildOnly: false,
    args: false,
    aliases: ["r12"],
    category: "admin",
	
    async execute(bot, msg) {
        const Discord = require('discord.js');
        const avdray = bot.guilds.find(g => g.id === bot.config.avdrayID);
        const emb = new Discord.MessageEmbed()
			.addField("Règle 12", "Tout contenu illégal étant concrètement nuisible est interdit.")
            .setColor('#000000');
            
            if (avdray != null) {
                emb.setFooter("Règlement de " + avdray.name, avdray.iconURL);
            }
			
		msg.channel.send(emb);
    }
};