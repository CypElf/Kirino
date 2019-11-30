module.exports = {
	name: 'tinydb',
    description: 'Envoie le lien de tinyDB, le remplaçant de title DB.',
    guildOnly: false,
    args: false,
    category: "hack",
    
    async execute(bot, msg) {
        const Discord = require('discord.js');
        const emb = new Discord.RichEmbed()
			.addField("TinyDB", "TitleDB a fermé depuis quelques temps. Son remplaçant, aujourd'hui, est [TinyDB](https://tinydb.eiphax.tech/).")
			.setColor('#DFC900')
			.setFooter("Requête de " + msg.author.username, msg.author.avatarURL);
        msg.channel.send(emb);
        if (msg.channel.type == 'text') {
            msg.delete();
        }
	},
};