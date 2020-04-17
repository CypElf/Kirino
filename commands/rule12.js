module.exports = {
	name: "rule12",
    description: __("description_rule12"),
    guildOnly: true,
    args: false,
    category: "admin",
    
    async execute(bot, msg) {
        if (msg.channel.type === "text") {
            if (msg.guild.id === bot.config.avdrayID) {
                const Discord = require("discord.js");
                const avdray = bot.guilds.cache.find(g => g.id === bot.config.avdrayID);
                const emb = new Discord.MessageEmbed()
                    .addField(__("rule_title") + "12", __("rule12"))
                    .setColor('#000000');
                    
                if (avdray != null) {
                    emb.setFooter(__("rules_from") + avdray.name, avdray.iconURL());
                }
                msg.channel.send(emb);
            }
        }
    }
};