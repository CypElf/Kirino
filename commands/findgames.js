const { prefix } = require('../config.json');
const Discord = require('discord.js');
module.exports = {
	name: 'findgames',
    description: 'Explique comment et où trouver des roms en `.cia`, pour 3ds.',
    guildOnly: false,
    args: false,
    aliases: ["fg"],
    category: "hack",

	async execute(bot, msg) {

        const emb = new Discord.RichEmbed()
			.addField("Trouver des roms de jeux 3ds", `Pour installer des jeux sur votre 3ds hackée, il vous faut trouver sur internet la rom au format \`.cia\`.\nBeaucoup de sites proposent des roms.\nVous pouvez en trouver notamment dans le CDN suivant (**[partie 1](https://1fichier.com/dir/FD7nUGuA), [partie 2](https://1fichier.com/dir/nfBWUHfH), [partie 3](https://1fichier.com/dir/7X3bHBEm)**), sur **[3dscia](https://www.3dscia.com/)**, ou encore sur **[Ziperto](https://www.ziperto.com/nintendo/3ds-roms)**.\nÀ noter que les jeux téléchargés sur **[3dscia](https://www.3dscia.com/)** ont tous besoin d'un mot de passe pour être extrait, qui est \"3dscia.com\".\nC'est exactement pareil pour les **mises à jour** ainsi que les **DLC** des jeux : vous devez les trouver au format \`.cia\`.\nPour savoir comment les installer, vous pouvez faire la commande \`${prefix}installcia\`.`)
			.setColor('#DFC900')
			.setFooter("Requête de " + msg.author.username, msg.author.avatarURL);
		msg.channel.send(emb);
        if (msg.channel.type == 'text') {
            msg.delete();
        }
	}
};