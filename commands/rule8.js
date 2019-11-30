module.exports = {
	name: 'rule8',
    description: "Affiche la règle 8 du règlement de Avdray.",
    guildOnly: false,
    args: false,
    aliases: ["r8"],
    category: "admin",
	
    async execute(bot, msg) {
        const Discord = require('discord.js');
        const avdray = bot.guilds.find(g => g.id === bot.config.avdrayID);
        const emb = new Discord.RichEmbed()
			.addField("Règle 8", "Ne pas usurper l'identité de quelqu'un en mettant la même photo de profil et / ou le même pseudo.")
            .setColor('#000000');
            
            if (avdray != null) {
                emb.setFooter("Règlement de " + avdray.name, avdray.iconURL);
            }
			
		msg.channel.send(emb);
    }
};