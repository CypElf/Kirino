module.exports = {
	name: 'rule5',
    description: "Affiche la règle 5 du règlement de Avdray.",
    guildOnly: true,
    args: false,
    category: "admin",
	
    async execute(bot, msg) {
        if (msg.channel.type === "text") {
            if (msg.guild.id === bot.config.avdrayID) {
                const Discord = require('discord.js');
                const avdray = bot.guilds.cache.find(g => g.id === bot.config.avdrayID);
                const emb = new Discord.MessageEmbed()
                    .addField("Règle 5", "Pas d'insultes, d'irrespect, de mots vulgaires, de provocation, de menaces, de contenu nsfw, etc.")
                    .setColor('#000000');
                    
                    if (avdray != null) {
                        emb.setFooter("Règlement de " + avdray.name, avdray.iconURL());
                    }
                    
                msg.channel.send(emb);
            }
        }
    }
};