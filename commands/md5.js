module.exports = {
	name: "md5",
    description: "description_md5",
    guildOnly: false,
	args: true,
    category: "programming",
    usage: "usage_md5",

	async execute (bot, msg, args) {
        const md5 = require("js-md5")

        const plaintext = args.join(" ").toLowerCase()

        if (plaintext.length > 1024) return msg.channel.send(__("less_or_equal_to_1024"))

        const encrypted = md5.create().update(plaintext)

        const Discord = require("discord.js")
        let baseEmbed = new Discord.MessageEmbed()
            .setTitle(__("md5_hashing"))
            .setThumbnail("https://cdn.discordapp.com/attachments/714381484617891980/720180307063472179/md5.png")
            .setColor("#559955")
            .addField(__("original_message"), plaintext)
            .addField(__("hash"), encrypted.hex().toUpperCase())
            .setFooter(__("request_from") + msg.author.username, msg.author.displayAvatarURL())
		msg.channel.send(baseEmbed)
	}
}