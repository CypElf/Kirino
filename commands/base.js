module.exports = {
	name: "base",
    guildOnly: false,
	args: true,
    category: "programming",

	async execute (bot, msg, args) {
        if (args.length < 3) {
            return msg.channel.send(__("not_much_arguments"))
        }

        const number = args[0].toLowerCase()
        const inputBase = args[1]
        const outputBase = args[2]

        if (isNaN(inputBase) || inputBase < 2 || inputBase > 36 || isNaN(outputBase) || outputBase < 2 || outputBase > 36) {
            return msg.channel.send(__("base_out_of_range"))
        }

        const convertedToDecimal = parseInt(number, inputBase)
        if (isNaN(convertedToDecimal)) {
            return msg.channel.send(__("bad_number"))
        }

        const convertedToOutputBase = convertedToDecimal.toString(outputBase)

        const Discord = require("discord.js")
        let baseEmbed = new Discord.MessageEmbed()
            .setTitle(__("numeric_base_conversion"))
            .setThumbnail("https://cdn.discordapp.com/attachments/714381484617891980/720178440078229554/binary_flat.png")
            .setColor("#000000")
            .addField(`${__("original_number_in_base")} ${inputBase}`, `**${number}**`)
            .addField(`${__("converted_number_in_base")} ${outputBase}`, `**${convertedToOutputBase}**`)
            .setFooter(__("request_from") + msg.author.username, msg.author.displayAvatarURL())
		msg.channel.send(baseEmbed)
	}
}