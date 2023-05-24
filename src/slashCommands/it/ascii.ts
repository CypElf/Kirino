const { SlashCommandBuilder } = require("@discordjs/builders")
const { MessageEmbed } = require("discord.js")
const t = require("i18next").t.bind(require("i18next"))

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ascii")
        .setDescription("Allows you to encode or decode ASCII")
        .addSubcommand(option => option.setName("encode").setDescription("Encode a text in ASCII").addStringOption(option => option.setName("text").setDescription("The text to encode").setRequired(true)))
        .addSubcommand(option => option.setName("decode").setDescription("Decode a text from ASCII").addStringOption(option => option.setName("text").setDescription("The text to decode").setRequired(true))),
    guildOnly: false,

    async execute(bot, interaction) {
        const text = interaction.options.getString("text").replaceAll(" ", "")
        const subcommand = interaction.options.getSubcommand()

        let output = ""

        const asciiEmbed = new MessageEmbed()
            .setTitle("ASCII")
            .setThumbnail("https://cdn.discordapp.com/attachments/698105563195768846/720189759560876052/ascii.png")
            .setColor("#555599")
            .setFooter({ text: t("common:request_from", { username: interaction.user.username }), iconURL: interaction.user.displayAvatarURL() })

        if (subcommand === "encode") {
            if (text.length > 340) return interaction.reply({ content: t("less_or_equal_to_340"), ephemeral: true })
            for (let i = 0; i < text.length; i++) {
                output += text.charCodeAt(i)
            }
            asciiEmbed.addField(t("original_message"), text)
                .addField(t("encoded_message"), output)
        }

        else if (subcommand === "decode") {
            if (text.length > 1024) return interaction.reply({ content: t("less_or_equal_to_1024"), ephemeral: true })
            let num = 0
            for (let i = 0; i < text.length; i++) {
                num = num * 10 + text.charCodeAt(i) - 48 // 48 = '0'
                if (num >= 32 && num <= 122) {
                    output += String.fromCharCode(num)
                    num = 0
                }
            }

            if (!(/\S/.test(output))) output = t("char_not_printable")
            asciiEmbed.addField(t("encoded_message"), text)
                .addField(t("original_message"), output)
        }

        interaction.reply({ embeds: [asciiEmbed] })
    }
}