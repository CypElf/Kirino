const { SlashCommandBuilder } = require("@discordjs/builders")
const { MessageEmbed } = require("discord.js")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("base64")
        .setDescription("Allows to encode or decode a message with base64 encoding")
        .addSubcommand(option => option.setName("encode").setDescription("Encode a text in base64").addStringOption(option => option.setName("text").setDescription("The text to encode in base64").setRequired(true)))
        .addSubcommand(option => option.setName("decode").setDescription("Decode a text from base64").addStringOption(option => option.setName("text").setDescription("The text to decode from base64").setRequired(true))),
    guildOnly: false,

    async execute(bot, interaction) {
        const text = interaction.options.getString("text")
        const subcommand = interaction.options.getSubcommand()

        const base64Embed = new MessageEmbed()

        if (subcommand === "encode") {
            if (text.length > 760) {
                return interaction.reply({ content: __("message_too_long_for_encoding"), ephemeral: true })
            }

            const buffer = new Buffer.from(text)
            const convertedInput = buffer.toString("base64")

            base64Embed.setTitle(__("base64_encoding"))
                .addField(__("original_message"), `${text}`)
                .addField(__("encoded_message"), `${convertedInput}`)
        }

        else if (subcommand === "decode") {
            if (text.length > 1024) {
                return interaction.reply({ content: __("message_too_long_for_decoding"), ephemeral: true })
            }
            const buffer = new Buffer.from(text, "base64")
            const convertedInput = buffer.toString("utf8")

            base64Embed.setTitle(__("base64_decoding"))
                .addField(__("encoded_message"), text)
                .addField(__("original_message"), convertedInput)
        }

        base64Embed.setColor("#08857A")
            .setFooter(__("request_from") + interaction.user.username, interaction.user.displayAvatarURL())
            .setThumbnail("https://cdn.discordapp.com/attachments/714381484617891980/714381707842813984/base64.png")

        interaction.reply({ embeds: [base64Embed] })
    }
}