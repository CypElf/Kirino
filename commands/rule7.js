module.exports = {
	name: 'rule7',
    description: "Affiche la règle 7 du règlement de Avdray.",
    guildOnly: false,
    args: false,
    aliases: ["r7"],
    category: "admin",
	
    async execute(bot, msg) {
        const Discord = require('discord.js');
        const avdray = bot.guilds.find(g => g.id === bot.config.avdrayID);
        const emb = new Discord.MessageEmbed()
			.addField("Règle 7", "Interdiction de diffuser la moindre information personnelle sur quelqu'un sans son accord.")
            .setColor('#000000');
            
            if (avdray != null) {
                emb.setFooter("Règlement de " + avdray.name, avdray.iconURL);
            }
			
		msg.channel.send(emb);
    }
};