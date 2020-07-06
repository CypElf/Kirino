module.exports = {
	name: "rot13",
    description: "description_rot13",
    guildOnly: false,
	args: true,
    category: "programming",
    usage: "usage_rot13",

	async execute (bot, msg, args) {
        const plaintext = args.join(" ").toLowerCase()

        if (plaintext.length > 1024) return msg.channel.send(__("less_or_equal_to_1024"))

        let encrypted = plaintext.replace(/[a-zA-Z]/g,c => String.fromCharCode((c <= "Z" ? 90 : 122) >= (c = c.charCodeAt(0) + 13) ? c : c-26))

        const Discord = require("discord.js")
        let baseEmbed = new Discord.MessageEmbed()
            .setTitle("ROT13")
            .setThumbnail("https://cdn.discordapp.com/attachments/698105563195768846/720184508514828318/rot13.png")
            .setColor("#555599")
            .addField(__("original_message"), plaintext)
            .addField(__("encoded_message"), encrypted)
            .setFooter(__("request_from") + msg.author.username, msg.author.displayAvatarURL())
		msg.channel.send(baseEmbed)
	}
}