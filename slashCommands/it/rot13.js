const { SlashCommandBuilder } = require("@discordjs/builders")
const { MessageEmbed } = require("discord.js")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("rot13")
        .setDescription(__("description_rot13"))
        .addStringOption(option => option.setName("text").setDescription("The text you want to encode").setRequired(true)),
    guildOnly: false,

    async execute(bot, interaction) {
        const plaintext = interaction.options.getString("text")
        if (plaintext.length > 1024) return interaction.reply({ content: __("less_or_equal_to_1024"), ephemeral: true })

        const encrypted = plaintext.replace(/[a-zA-Z]/g, c => String.fromCharCode((c <= "Z" ? 90 : 122) >= (c = c.charCodeAt(0) + 13) ? c : c - 26))

        const baseEmbed = new MessageEmbed()
            .setTitle("ROT13")
            .setThumbnail("https://cdn.discordapp.com/attachments/698105563195768846/720184508514828318/rot13.png")
            .setColor("#555599")
            .addField(__("original_message"), plaintext)
            .addField(__("encoded_message"), encrypted)
            .setFooter(__("request_from") + interaction.user.username, interaction.user.displayAvatarURL())

        interaction.reply({ embeds: [baseEmbed] })
    }
}