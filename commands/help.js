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
			let helpEmbed = new Discord.MessageEmbed()
				.setColor('#DFC900')
				.setFooter(__("request_from") + msg.author.username, msg.author.displayAvatarURL())

			const dataJoined = bot.commands.array()

			const adminCommands = "`" + dataJoined.filter(command => command.category === "admin").map(command => command.name).join("`, `") + "`"
			const utilityCommands = "`" + dataJoined.filter(command => command.category === "utility").map(command => command.name).join("`, `") + "`"
			const xpCommands = "`" + dataJoined.filter(command => command.category === "xp").map(command => command.name).join("`, `") + "`"
			const programmingCommands = "`" + dataJoined.filter(command => command.category === "programming").map(command => command.name).join("`, `") + "`"
			const othersCommands = "`" + dataJoined.filter(command => command.category === "others").map(command => command.name).join("`, `") + "`"

			if (adminCommands) helpEmbed.addField(__("administration"), adminCommands)
			if (utilityCommands) helpEmbed.addField(__("utility"), utilityCommands)
			if (xpCommands) helpEmbed.addField(__("xp"), xpCommands)
			if (programmingCommands) helpEmbed.addField(__("it"), programmingCommands)
			if (othersCommands) helpEmbed.addField(__("others"), othersCommands + "\n\n" + __("you_can_do") + " `" + prefix + "help " + __("usage_help") + "` " + __("to_get_infos_on_a_command"))
	
			return msg.channel.send(helpEmbed)
		}

		// ------------------------------------------------------------------- help on specitif command

		const commandName = args[0].toLowerCase()

		let command = bot.commands.get(commandName) || bot.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName))
		if (command && command.category === "ignore") command = undefined

		if (!command) return msg.channel.send(__("this_command_does_not_exist"))
		
		const helpEmbed = new Discord.MessageEmbed()
			.setColor('#DFC900')
			.setTitle(`**${__("command")} : ${command.name}**`)
			.setFooter(__("request_from") + msg.author.username, msg.author.displayAvatarURL())

	
		if (command.description) {
			let first = true

			let descriptions = [""]
			let i = 0
			for (const line of __(command.description).split("\n")) {
				if (descriptions[i].length + line.length > 1024) {
					i++
					descriptions[i] = ""
				}
				if (descriptions[i] !== "") descriptions[i] += "\n"
				descriptions[i] += line
			}

			for (const descriptionPart of descriptions) {
				if (first) {
					helpEmbed.addField(`**${__("description")}**`, descriptionPart)
					first = false
				}
				else helpEmbed.addField(`**${__("description_continuation")}**`, descriptionPart)
			}
		}
		command.guildOnly ? helpEmbed.addField(`**${__("available_in_dm")}**`, __("no")) : helpEmbed.addField(`**${__("available_in_dm")}**`, __("yes"))
		if (command.aliases) helpEmbed.addField(`**${__("aliases")}**`, `\`${command.aliases.join("`, `")}\``)
		
		if (command.usage) helpEmbed.addField(`**${__("usage")}**`, __(command.usage).split("\n").map(usage => `\`${prefix}${command.name} ${usage}\``).join("\n"))

		let cooldown = 2
		if (command.cooldown) cooldown = command.cooldown
		helpEmbed.addField(`**${__("cooldown")}**`, `\`${cooldown}\``, true)

		if (command.permissions) helpEmbed.addField(`**${__("required_permissions")}**`, `\`${command.permissions.join("`, `")}\``, true)
		else helpEmbed.addField(`**${__("required_permissions")}**`, `\`${__("nothingF")}\``, true)
				
		msg.channel.send(helpEmbed)
	}
}