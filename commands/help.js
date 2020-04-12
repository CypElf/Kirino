module.exports = {
	name: 'help',
	description: "Liste les commandes disponibles ou les informations sur une commande en particulier.\nQuand les informations sur une commande sont affichées, si la commande est utilisable avec des arguments, ceux ci seront entre crochets `[]` quand ils sont obligatoires, ou entre accolades `{}` s'ils sont optionnels.",
	guildOnly: false,
	usage: '{commande}',
	category: "others",

	async execute (bot, msg, args) {
		const { prefix } = require('../config.json');
		const Discord = require('discord.js');
		
		let data = [];
		let dataJoined;
	
		if (!args.length) {
			
			let help_embed = new Discord.RichEmbed()
				.setColor('#DFC900')
				.setFooter("Requête de " + msg.author.username, msg.author.avatarURL);
	
			let first = true;
			bot.commands.forEach(command => {
				if (command.category == "admin") {
					if (first) {
						data.push("`" + command.name + "`");
						first = false;
					}
					else {
						data.push(", `" + command.name + "`");
					}
				}
			});

			dataJoined = data.join("");
			if (dataJoined) {
				help_embed.addField("Administration", dataJoined);
			}
			
			data = [];
			first = true;
			bot.commands.forEach(command => {
				if (command.category == "others") {
					if (first) {
						data.push("`" + command.name + "`");
						first = false;
					}
					else {
						data.push(", `" + command.name + "`");
					}
				}
			});

			dataJoined = data.join("");
			if (dataJoined) {
				help_embed.addField("Autres", dataJoined + `\n\nVous pouvez faire \`${prefix}help [commande]\` pour avoir des informations sur une commande en particulier.`);
			}
	
			return msg.channel.send(help_embed)
			.catch(err => {
				console.error(err);
			});
		}

		const command = bot.commands.get(args[0].toLowerCase()) || bot.commands.find(cmd => cmd.aliases && cmd.aliases.includes(args[0].toLowerCase()));
    	if (!command) return msg.channel.send("Cette commande n'existe pas.");
	
		if (command.description) data.push(`**Description** : ${command.description}`);
		command.guildOnly ? data.push(`**Disponible en messages privés** : non`) : data.push(`**Disponible en messages privés** : oui`);
		if (command.aliases) {
			let aliasesStr = "";
			command.aliases.forEach(aliase => {
				aliasesStr += "`" + aliase + "`, ";
			});
			aliasesStr = aliasesStr.substring(0, aliasesStr.length - 2);

			data.push("**Aliases** : " + aliasesStr);
		}
		if (command.usage) data.push(`**Utilisation** : \`${prefix}${command.name} ${command.usage}\``);
		
		const texte = data.join('\n');
	
		const help_embed = new Discord.RichEmbed()
			.setColor('#DFC900')
			.addField("**Commande : " + command.name + "**", texte)
			.setFooter("Requête de " + msg.author.username, msg.author.avatarURL);
		msg.channel.send(help_embed);
	}
};