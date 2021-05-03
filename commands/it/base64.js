module.exports = {
	name: "base64",
    guildOnly: false,
	args: true,

	async execute (bot, msg, args) {
        if (args.length < 2) {
            return msg.channel.send(__("not_enough_args_for_base64"))
        }

        mode = args[0].toLowerCase()
        input = args.slice(1).join(" ")

        if (mode !== "encode" && mode !== "decode") {
            return msg.channel.send(__("enter_valid_mode"))
        }

        const Discord = require("discord.js")
        let base64Embed = new Discord.MessageEmbed()

        if (mode === "encode") {
            if (input.length > 760) {
                return msg.channel.send(__("message_too_long_for_encoding"))
            }

            const buffer = new Buffer.from(input)
            const convertedInput = buffer.toString("base64")
            
            base64Embed.setTitle(__("base64_encoding"))
                .addField(__("original_message"), `${input}`)
                .addField(__("encoded_message"), `${convertedInput}`)
        }

        else {
            if (input.length > 1024) {
                return msg.channel.send(__("message_too_long_for_decoding"))
            }
            const buffer = new Buffer.from(input, "base64")
            const convertedInput = buffer.toString("utf8")
            
            base64Embed.setTitle(__("base64_decoding"))
                .addField(__("encoded_message"), input)
                .addField(__("original_message"), convertedInput)
        }

        base64Embed.setColor("#08857A")
            .setFooter(__("request_from") + msg.author.username, msg.author.displayAvatarURL())
            .setThumbnail("https://cdn.discordapp.com/attachments/714381484617891980/714381707842813984/base64.png")
        msg.channel.send(base64Embed)
	}
}