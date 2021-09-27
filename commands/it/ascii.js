const Discord = require("discord.js")

module.exports = {
    name: "ascii",
    guildOnly: false,
    args: true,

    async execute(bot, msg, args) {
        if (args.length < 2) return msg.channel.send(__("two_args_needed"))

        const mode = args[0]
        args.splice(0, 1)
        const input = args.join("")
        let output = ""

        if (mode !== "encode" && mode !== "decode") return msg.channel.send(__("enter_valid_mode"))

        const asciiEmbed = new Discord.MessageEmbed()
            .setTitle("ASCII")
            .setThumbnail("https://cdn.discordapp.com/attachments/698105563195768846/720189759560876052/ascii.png")
            .setColor("#555599")
            .setFooter(__("request_from") + msg.author.username, msg.author.displayAvatarURL())

        if (mode === "encode") {
            if (input.length > 340) return msg.channel.send(__("less_or_equal_to_340"))
            for (let i = 0 ; i < input.length ; i++) {
                output += input.charCodeAt(i)
            }
            asciiEmbed.addField(__("original_message"), input)
                .addField(__("encoded_message"), output)
        }

        else if (mode === "decode") {
            if (input.length > 1024) return msg.channel.send(__("less_or_equal_to_1024"))
            let num = 0
            for (let i = 0 ; i < input.length ; i++) {
                num = num * 10 + input.charCodeAt(i) - 48 // 48 = '0'
                if (num >= 32 && num <= 122) {
                    output += String.fromCharCode(num)
                    num = 0
                }
            }

            if (!(/\S/.test(output))) output = __("char_not_printable")
            asciiEmbed.addField(__("encoded_message"), input)
                .addField(__("original_message"), output)
        }

        msg.channel.send({ embeds: [asciiEmbed] })
    }
}