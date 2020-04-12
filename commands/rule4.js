module.exports = {
	name: 'rule4',
    description: "Affiche la règle 4 du règlement de Avdray.",
    guildOnly: false,
    args: false,
    aliases: ["r4"],
    category: "admin",
	
    async execute(bot, msg) {
        const Discord = require('discord.js');
        const avdray = bot.guilds.find(g => g.id === bot.config.avdrayID);
        const emb = new Discord.RichEmbed()
			.addField("Règle 4", "Ne spammez et ne floodez pas.")
            .setColor('#000000');
            
            if (avdray != null) {
                emb.setFooter("Règlement de " + avdray.name, avdray.iconURL);
            }
			
		msg.channel.send(emb);
    }
};