module.exports = {
	name: 'rule3',
    description: "Affiche la règle 3 du règlement de Avdray.",
    guildOnly: true,
    args: false,
    category: "admin",
	
    async execute(bot, msg) {
        if (msg.channel.type === "text") {
            if (msg.guild.id === bot.config.avdrayID) {
                const Discord = require('discord.js');
                const avdray = bot.guilds.cache.find(g => g.id === bot.config.avdrayID);
                const emb = new Discord.MessageEmbed()
                    .addField("Règle 3", "Ne mentionnez pas des gens inutilement.")
                    .setColor('#000000');
                    
                    if (avdray != null) {
                        emb.setFooter("Règlement de " + avdray.name, avdray.iconURL());
                    }
                    
                msg.channel.send(emb);
            }
        }
    }
};