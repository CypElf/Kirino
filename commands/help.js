module.exports = {
	name: "help",
	description: "description_help",
	guildOnly: false,
	usage: "usage_help",
	category: "others",

	async execute (bot, msg, args) {
		const prefix = bot.config.prefix
		const Discord = require("discord.js")
		
		let data = []
		let dataJoined
	
		if (!args.length) {
			
			let help_embed = new Discord.MessageEmbed()
				.setColor('#DFC900')
				.setFooter(__("request_from") + msg.author.username, msg.author.displayAvatarURL())
	
			let first = true
			bot.commands.forEach(command => {
				if (command.category == "admin") {
					if (!(msg.channel.type === "text" && msg.guild.id === bot.config.avdrayID)) {
						if (first) {
							data.push("`" + command.name + "`")
							first = false
						}
						else {
							data.push(", `" + command.name + "`")
						}
					}
					else {
						if (first) {
							data.push("`" + command.name + "`")
							first = false
						}
						else {
							data.push(", `" + command.name + "`")
						}
					}
				}
			})

			dataJoined = data.join("")
			if (dataJoined) {
				help_embed.addField(__("administration"), dataJoined)
			}
			
			data = []
			first = true
			bot.commands.forEach(command => {
				if (command.category == "others") {
					if (!(command.name === "avdray" && (msg.channel.type !== "text" || msg.guild.id !== bot.config.avdrayID ))) {
						if (first) {
							data.push("`" + command.name + "`")
							first = false
						}
						else {
							data.push(", `" + command.name + "`")
						}
					}
				}
			})

			dataJoined = data.join("")
			if (dataJoined) {
				help_embed.addField(__("others"), dataJoined + "\n\n" + __("you_can_do") + " `" + prefix + "help " + __("usage_help") + "` " + __("to_get_infos_on_a_command"))
			}
	
			return msg.channel.send(help_embed)
			.catch(err => {
				console.error(err)
			})
		}

		let command = bot.commands.get(args[0].toLowerCase()) || bot.commands.find(cmd => cmd.aliases && cmd.aliases.includes(args[0].toLowerCase()))
		if (command) {
			if (!(msg.channel.type ==="text" && msg.guild.id === bot.config.avdrayID)) {
				if (command.name === "avdray") {
					command = undefined
				}
			}
		}
    	if (!command) return msg.channel.send(__("this_command_does_not_exist"))
	
		if (command.description) data.push("**" + __("description") + "**" + " : " + __(command.description))
		command.guildOnly ? data.push("**" + __("available_in_dm") + "** : " + __("no")) : data.push("**" + __("available_in_dm") + "** : " + __("yes"))
		if (command.aliases) {
			let aliasesStr = ""
			command.aliases.forEach(aliase => {
				aliasesStr += "`" + aliase + "`, "
			})
			aliasesStr = aliasesStr.substring(0, aliasesStr.length - 2)

			data.push("**" + __("aliases") + "** : " + aliasesStr)
		}
		if (command.usage) data.push("**" + __("usage") + "** : `" + prefix + command.name + " " + __(command.usage) + "`")
		
		const texte = data.join('\n')
	
		const help_embed = new Discord.MessageEmbed()
			.setColor('#DFC900')
			.addField("**" + __("command") + " : " + command.name + "**", texte)
			.setFooter(__("request_from") + msg.author.username, msg.author.displayAvatarURL())
		msg.channel.send(help_embed)
	}
}