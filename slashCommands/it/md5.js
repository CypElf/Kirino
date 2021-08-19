const { SlashCommandBuilder } = require("@discordjs/builders")
const { MessageEmbed } = require("discord.js")
const md5 = require("js-md5")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("md5")
        .setDescription(__("description_md5"))
        .addStringOption(option => option.setName("text").setDescription("The text you want to get the hash").setRequired(true)),
    guildOnly: false,

    async execute(bot, interaction) {
        const plaintext = interaction.options.getString("text")
        if (plaintext.length > 1024) return interaction.reply({ content: __("less_or_equal_to_1024"), ephemeral: true })

        const hash = md5.create().update(plaintext).hex().toUpperCase()

        const baseEmbed = new MessageEmbed()
            .setTitle(__("md5_hashing"))
            .setThumbnail("https://cdn.discordapp.com/attachments/714381484617891980/720180307063472179/md5.png")
            .setColor("#559955")
            .addField(__("original_message"), plaintext)
            .addField(__("hash"), hash)
            .setFooter(__("request_from") + interaction.user.username, interaction.user.displayAvatarURL())

        interaction.reply({ embeds: [baseEmbed] })
    }
}