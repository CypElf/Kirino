module.exports = {
	name: "help",
	description: "description_help",
	guildOnly: false,
	usage: "usage_help",
	category: "utility",

	async execute (bot, msg, args) {
		const prefix = bot.prefix
		const Discord = require("discord.js")

		// ------------------------------------------------------------------- general help
	
		if (!args.length) {
			
			let help_embed = new Discord.MessageEmbed()
				.setColor('#DFC900')
				.setFooter(__("request_from") + msg.author.username, msg.author.displayAvatarURL())

			const dataJoined = bot.commands.array()
			const adminCommands = "`" + dataJoined.filter(command => command.category === "admin").map(command => command.name).join("`, `") + "`"
			const utilityCommands = "`" + dataJoined.filter(command => command.category === "utility").map(command => command.name).join("`, `") + "`"
			const programmingCommands = "`" + dataJoined.filter(command => command.category === "programming").map(command => command.name).join("`, `") + "`"
			const othersCommands = "`" + dataJoined.filter(command => command.category === "others" && !(command.name === "avdray" && (msg.channel.type !== "text" || msg.guild.id !== bot.config.avdrayID ))).map(command => command.name).join("`, `") + "`"

			if (adminCommands) {
				help_embed.addField(__("administration"), adminCommands)
			}
			if (utilityCommands) {
				help_embed.addField(__("utility"), utilityCommands)
			}
			if (programmingCommands) {
				help_embed.addField(__("programming"), programmingCommands)
			}
			if (othersCommands) {
				help_embed.addField(__("others"), othersCommands + "\n\n" + __("you_can_do") + " `" + prefix + "help " + __("usage_help") + "` " + __("to_get_infos_on_a_command"))
			}
	
			return msg.channel.send(help_embed)
			.catch(err => {
				console.error(err)
			})
		}

		// ------------------------------------------------------------------- help on specitif command

		let data = []
		const commandName = args[0].toLowerCase()

		let command = bot.commands.get(commandName) || bot.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName))
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