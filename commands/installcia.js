const Discord = require('discord.js');

module.exports = {
	name: 'installcia',
    description: 'Explique comment installer un fichier `.cia` sur une 3ds hackée à l\'aide de FBI.',
    guildOnly: false,
    args: false,
    aliases: ["ic"],
    category: "hack",

	async execute(bot, msg) {
        const emb = new Discord.RichEmbed()
			.addField("Installer un fichier `.cia`", "Pour installer un fichier `.cia`, commencez par mettre celui ici quelque part sur votre carte SD. L'emplacement importe peu, mais en général on met les `.cia` dans un dossier `cias` à la racine de la carte SD pour les retrouver facilement.\nUne fois ceci fait, lancez **FBI** et naviguez dans `SD`, jusqu'à votre fichier. Faites `install` dessus (ou `install and delete` pour le supprimer de la carte SD une fois l'installation terminée, option conseillée pour gagner un peu de place sur la carte SD).")
			.setColor('#DFC900')
			.setFooter("Requête de " + msg.author.username, msg.author.avatarURL);
        msg.channel.send(emb);
        
        if (msg.channel.type == 'text') {
            msg.delete();
        }
	}
};