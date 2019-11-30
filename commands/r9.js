module.exports = {
	name: 'r9',
    description: "Affiche la règle 9 du règlement de Avdray.",
    guildOnly: false,
    args: false,
    category: "admin",
	
    async execute(bot, msg) {
        const Discord = require('discord.js');
        const avdray = bot.guilds.find(g => g.id === bot.config.avdrayID);
        const emb = new Discord.RichEmbed()
			.addField("Règle 9", "Interdiction de diffuser des infos personnelles sur des gens sans leur accord.")
            .setColor('#000000');
            
            if (avdray != null) {
                emb.setFooter("Règlement de " + avdray.name, avdray.iconURL);
            }
			
		msg.channel.send(emb);
    }
};