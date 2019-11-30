module.exports = {
	name: 'rule1',
    description: "Affiche la règle 1 du règlement de Avdray.",
    guildOnly: false,
    args: false,
    aliases: ["r1"],
    category: "admin",
    
    async execute(bot, msg) {
        const Discord = require('discord.js');
        const avdray = bot.guilds.find(g => g.id === bot.config.avdrayID);
        const emb = new Discord.RichEmbed()
			.addField("Règle 1", "Vous devez parler du bon sujet dans le bon salon (exemple : pour parler du hack 3ds allez dans <#444836115292094464>).")
            .setColor('#000000');
            
            if (avdray != null) {
                emb.setFooter("Règlement de " + avdray.name, avdray.iconURL);
            }
			
		msg.channel.send(emb);
    }
};