module.exports = {
	name: "help",
	guildOnly: false,

	async execute (bot, msg, args) {
		const prefix = bot.prefix
		const { MessageEmbed } = require("discord.js")
		const fs = require("fs")

		// ------------------------------------------------------------------- general help
	
		if (!args.length) {
			let helpEmbed = new MessageEmbed()
				.setColor('#DFC900')
				.setFooter(__("request_from") + msg.author.username, msg.author.displayAvatarURL())

			const dataJoined = bot.commands.array()

			const categories = fs.readdirSync("./commands/").filter(category => category !== "ignore")
			for (const category of categories) {
				let commands = `\`${dataJoined.filter(command => command.category === category).map(command => command.name).join("`, `")}\``
				
				if (commands) {
					if (category == categories[categories.length - 1]) commands += `\n\n${__("you_can_do")} \`${prefix}help ${__("usage_help")}\` ${__("to_get_infos_on_a_command")}`
					helpEmbed.addField(__(category), commands)
				} 
			}
	
			return msg.channel.send({ embeds: [helpEmbed] })
		}

		// ------------------------------------------------------------------- help on specific command

		const commandId = args[0].toLowerCase()
		let command = bot.commands.get(commandId) || bot.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandId))
		if (command && command.category === "ignore") command = undefined

		if (!command) return msg.channel.send(__("this_command_does_not_exist"))
		
		const helpEmbed = new MessageEmbed()
			.setColor('#DFC900')
			.setTitle(`**${__("command")} : ${command.name}**`)
			.setFooter(__("help_footer"), "https://cdn.discordapp.com/attachments/714381484617891980/748487155214712842/d95a24865c58c14548e439defc097222.png")
	
		if (__(`description_${command.name}`) !== `description_${command.name}`) {

			const toChunks = require("../../lib/string/to_chunks")
			let descriptions = toChunks(__(`description_${command.name}`))

			for (const descriptionPart of descriptions) {
				if (descriptionPart === descriptions[0]) helpEmbed.addField(`**${__("description")}**`, descriptionPart)
				else helpEmbed.addField(`**${__("description_continuation")}**`, descriptionPart)
			}
		}

		helpEmbed.addField(`**${__("available_in_dm")}**`, command.guildOnly ? __("no") : __("yes"))

		if (command.aliases) helpEmbed.addField(`**${__("aliases")}**`, `\`${command.aliases.join("`, `")}\``)
		
		if (__(`usage_${command.name}`) !== `usage_${command.name}`) helpEmbed.addField(`**${__("usage")}**`, __(`usage_${command.name}`).split("\n").map(usage => usage.startsWith("nocommand ") ? `\`${usage.slice(10)}\`` : `\`${prefix}${command.name} ${usage}\``).join("\n"))

		helpEmbed.addField(`**${__("cooldown")}**`, `\`${command.cooldown !== undefined ? command.cooldown : 2}\``, true)

		if (command.permissions) helpEmbed.addField(`**${__("required_permissions")}**`, `${command.permissions.join(", ")}`, true)
		else helpEmbed.addField(`**${__("required_permissions")}**`, `${__("nothingF")}`, true)
				
		msg.channel.send({ embeds: [helpEmbed] })
	}
}