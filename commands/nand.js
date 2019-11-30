module.exports = {
	name: 'nand',
    description: 'Donne la procédure à réaliser pour faire un backup de nand.',
    guildOnly: false,
    args: false,
    category: "hack",
	
	async execute(bot, msg) {
        const Discord = require('discord.js');
        const emb = new Discord.RichEmbed()
			.addField("Faire un backup de NAND de 3ds", "Tout d'abord, assurez vous d'avoir au moins **1,3** Go d'espace libre sur votre carte SD. Puis suivez les instructions ci dessous :\n1. Ouvrez Godmode9 en maintenant `start` au démarrage de votre 3ds\n2. Appuyez sur `home` pour faire apparaître le menu d’actions\n3. Allez dans `Scripts`\n4. Allez dans `GM9Megascript`\n5. Allez dans `Backup Options`\n6. Allez dans `SysNAND Backup`\n7. Appuyez sur `A` pour confirmer. Le processus va prendre quelques minutes.\n8. Une fois terminé, appuyez sur `A` pour continuer\n9. Appuyez sur `B` pour revenir au menu principal\n10. Sélectionnez `Exit`\n11. Appuyez sur `A` pour reverrouiller les autorisations en écriture si vous y êtes invité\n12. Maintenez `R` et appuyez sur `start` pour éteindre la console\n13. Insérez votre carte SD dans votre ordinateur\n14. Déplacez `<date>_<serialnumber>_sysnand_###.bin` et `essential.exefs` du dossier `/gm9/out/` de votre carte SD vers un emplacement sûr de votre ordinateur")
			.setColor('#DFC900')
			.setFooter("Requête de " + msg.author.username, msg.author.avatarURL);
		msg.channel.send(emb);
		if (msg.channel.type == "text") {
			msg.delete();
        }
	}
};