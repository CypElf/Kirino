const { SlashCommandBuilder } = require("@discordjs/builders")
const { MessageEmbed } = require("discord.js")
const t = require("i18next").t.bind(require("i18next"))

module.exports = {
    data: new SlashCommandBuilder()
        .setName("rot13")
        .setDescription("Encode your text with ROT13 (shift of 13 letters in the alphabet)")
        .addStringOption(option => option.setName("text").setDescription("The text you want to encode").setRequired(true)),
    guildOnly: false,

    async execute(bot, interaction) {
        const plaintext = interaction.options.getString("text")
        if (plaintext.length > 1024) return interaction.reply({ content: t("less_or_equal_to_1024"), ephemeral: true })

        const encrypted = plaintext.replace(/[a-zA-Z]/g, c => String.fromCharCode((c <= "Z" ? 90 : 122) >= (c = c.charCodeAt(0) + 13) ? c : c - 26))

        const baseEmbed = new MessageEmbed()
            .setTitle("ROT13")
            .setThumbnail("https://cdn.discordapp.com/attachments/698105563195768846/720184508514828318/rot13.png")
            .setColor("#555599")
            .addField(t("original_message"), plaintext)
            .addField(t("encoded_message"), encrypted)
            .setFooter({ text: t("common:request_from", { username: interaction.user.username }), iconURL: interaction.user.displayAvatarURL() })

        interaction.reply({ embeds: [baseEmbed] })
    }
}