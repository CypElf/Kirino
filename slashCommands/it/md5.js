const { SlashCommandBuilder } = require("@discordjs/builders")
const { MessageEmbed } = require("discord.js")
const t = require("i18next").t.bind(require("i18next"))
const md5 = require("js-md5")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("md5")
        .setDescription("Hash the specified text with the MD5 algorithm")
        .addStringOption(option => option.setName("text").setDescription("The text you want to get the hash").setRequired(true)),
    guildOnly: false,

    async execute(bot, interaction) {
        const plaintext = interaction.options.getString("text")
        if (plaintext.length > 1024) return interaction.reply({ content: t("less_or_equal_to_1024"), ephemeral: true })

        const hash = md5.create().update(plaintext).hex().toUpperCase()

        const baseEmbed = new MessageEmbed()
            .setTitle(t("md5_hashing"))
            .setThumbnail("https://cdn.discordapp.com/attachments/714381484617891980/720180307063472179/md5.png")
            .setColor("#559955")
            .addField(t("original_message"), plaintext)
            .addField(t("hash"), hash)
            .setFooter(t("common:request_from", { username: interaction.user.username }), interaction.user.displayAvatarURL())

        interaction.reply({ embeds: [baseEmbed] })
    }
}