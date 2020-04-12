const { prefix } = require("../config.json");
const Discord = require("discord.js");

module.exports = {
	name: 'luma',
    description: 'Envoie la version demandée de Luma 3DS.',
    guildOnly: false,
    args: true,
    usage: "[version de Luma]",
	category: "hack",
	
	async help(bot, msg, helpEmbed) {
		helpEmbed
			.setDescription("Cette commande envoie la version de Luma 3DS demandée.")
			.addField("Procédure", "Cette commande s'utilise comme ceci : `" + prefix + this.name + " " + this.usage + "`");
			msg.channel.send(helpEmbed);
	},
	
	async execute(bot, msg, args) {
		if (args[0] == "10.0.1") {
			const boot = new Discord.Attachment('https://cdn.glitch.com/95815403-f1a3-4b7b-8652-5976c8dec4c1%2Fluma1001.firm?v=1565982683112', "boot.firm");
			msg.channel.send(boot);
		}
		
		else if (args[0] == "9.1") {
			const boot = new Discord.Attachment('https://cdn.glitch.com/95815403-f1a3-4b7b-8652-5976c8dec4c1%2Fluma91.firm?v=1565982411282', "boot.firm");
			msg.channel.send(boot);
		}
		
		else {
			msg.channel.send("Seules les version 9.1 et 10.0.1 sont disponibles.");
		}
		
        if (msg.channel.type == 'text') {
            msg.delete();
        }
	}
};