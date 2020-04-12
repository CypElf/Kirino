module.exports = {
	name: 'rule9',
    description: "Affiche la règle 9 du règlement de Avdray.",
    guildOnly: false,
    args: false,
    aliases: ["r9"],
    category: "admin",
	
    async execute(bot, msg) {
        const Discord = require('discord.js');
        const avdray = bot.guilds.find(g => g.id === bot.config.avdrayID);
        const emb = new Discord.RichEmbed()
			.addField("Règle 9", "Faites des efforts pour écrire un minimum correctement, aidez vous du correcteur orthographique si besoin.")
            .setColor('#000000');
            
            if (avdray != null) {
                emb.setFooter("Règlement de " + avdray.name, avdray.iconURL);
            }
			
		msg.channel.send(emb);
    }
};