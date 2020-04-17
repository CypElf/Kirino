module.exports = {
	name: "rule11",
    description: "description_rule11",
    guildOnly: true,
    args: false,
    category: "admin",
    
    async execute(bot, msg) {
        if (msg.channel.type === "text") {
            if (msg.guild.id === bot.config.avdrayID) {
                const Discord = require("discord.js");
                const avdray = bot.guilds.cache.find(g => g.id === bot.config.avdrayID);
                const emb = new Discord.MessageEmbed()
                    .addField(__("rule_title") + "11", __("rule11"))
                    .setColor('#000000');
                    
                if (avdray != null) {
                    emb.setFooter(__("rules_from") + avdray.name, avdray.iconURL());
                }
                msg.channel.send(emb);
            }
        }
    }
};