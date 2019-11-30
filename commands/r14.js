module.exports = {
	name: 'r14',
    description: "Affiche la règle 14 du règlement de Avdray.",
    guildOnly: false,
    args: false,
    category: "admin",
	
    async execute(bot, msg) {
        const Discord = require('discord.js');
        const avdray = bot.guilds.find(g => g.id === bot.config.avdrayID);
        const emb = new Discord.RichEmbed()
			.addField("Règle 14", "N'utilisez pas abusivement les tags de spoil. Ils sont réservés aux vrais spoils.")
            .setColor('#000000');
            
            if (avdray != null) {
                emb.setFooter("Règlement de " + avdray.name, avdray.iconURL);
            }
			
		msg.channel.send(emb);
    }
};