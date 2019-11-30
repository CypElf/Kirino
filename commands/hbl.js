module.exports = {
	name: 'hbl',
    description: "Envoie la version 2.1.0 de l'homebrew launcher.",
    guildOnly: false,
    args: false,
    category: "hack",
    
    async execute(bot, msg) {
		const Discord = require("discord.js");
        const boot = new Discord.Attachment('https://cdn.glitch.com/95815403-f1a3-4b7b-8652-5976c8dec4c1%2Fboot.3dsx?v=1564761245053', "boot.3dsx");
        msg.channel.send(boot);
        if (msg.channel.type == 'text') {
            msg.delete();
        }
	}
};