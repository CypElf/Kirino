module.exports = {
	name: "help",
	guildOnly: false,
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

			const categories = [["admin", "administration"], ["utility", "utility"], ["xp", "xp"], ["programming", "it"], ["others", "others"], ["music", "music"]]
			for (const category of categories) {
				let commands = `\`${dataJoined.filter(command => command.category === category[0]).map(command => command.name).join("`, `")}\``
				
				if (commands) {
					if (category == categories[categories.length - 1]) commands += `\n\n${__("you_can_do")} \`${prefix}help ${__("usage_help")}\` ${__("to_get_infos_on_a_command")}`
					helpEmbed.addField(__(category[1]), commands)
				} 
			}
	
			return msg.channel.send(helpEmbed)
		}

		// ------------------------------------------------------------------- help on specific command

		const commandId = args[0].toLowerCase()
		let command = bot.commands.get(commandId) || bot.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandId))
		if (command && command.category === "ignore") command = undefined

		if (!command) return msg.channel.send(__("this_command_does_not_exist"))
		
		const helpEmbed = new Discord.MessageEmbed()
			.setColor('#DFC900')
			.setTitle(`**${__("command")} : ${command.name}**`)
			.setFooter(__("help_footer"), "https://cdn.discordapp.com/attachments/714381484617891980/748487155214712842/d95a24865c58c14548e439defc097222.png")
	
		if (__(`description_${command.name}`) !== `description_${command.name}`) {

			const toChunks = require("../lib/string/to_chunks")
			let descriptions = toChunks(__(`description_${command.name}`))

			for (const descriptionPart of descriptions) {
				if (descriptionPart === descriptions[0]) helpEmbed.addField(`**${__("description")}**`, descriptionPart)
				else helpEmbed.addField(`**${__("description_continuation")}**`, descriptionPart)
			}
		}

		let dm = __("yes")
		if (command.guildOnly) dm = __("no")
		helpEmbed.addField(`**${__("available_in_dm")}**`, dm)

		if (command.aliases) helpEmbed.addField(`**${__("aliases")}**`, `\`${command.aliases.join("`, `")}\``)
		
		if (__(`usage_${command.name}`) !== `usage_${command.name}`) helpEmbed.addField(`**${__("usage")}**`, __(`usage_${command.name}`).split("\n").map(usage => usage.startsWith("nocommand ") ? `\`${usage.slice(10)}\`` : `\`${prefix}${command.name} ${usage}\``).join("\n"))

		let cooldown = 2
		if (command.cooldown) cooldown = command.cooldown
		helpEmbed.addField(`**${__("cooldown")}**`, `\`${cooldown}\``, true)

		if (command.permissions) helpEmbed.addField(`**${__("required_permissions")}**`, `${command.permissions.join(", ")}`, true)
		else helpEmbed.addField(`**${__("required_permissions")}**`, `${__("nothingF")}`, true)
				
		msg.channel.send(helpEmbed)
	}
}