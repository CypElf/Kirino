module.exports = {
	name: 'rule9',
    description: "Affiche la règle 9 du règlement de Avdray.",
    guildOnly: false,
    args: false,
    category: "admin",
	
    async execute(bot, msg) {
        if (msg.channel.type === "text") {
            if (msg.guild.ID === bot.config.avdrayID) {
                const Discord = require('discord.js');
                const avdray = bot.guilds.cache.find(g => g.id === bot.config.avdrayID);
                const emb = new Discord.MessageEmbed()
                    .addField("Règle 9", "Faites des efforts pour écrire un minimum correctement, aidez vous du correcteur orthographique si besoin.")
                    .setColor('#000000');
                    
                    if (avdray != null) {
                        emb.setFooter("Règlement de " + avdray.name, avdray.iconURL());
                    }
                    
                msg.channel.send(emb);
            }
        }
    }
};