const { SlashCommandBuilder } = require("@discordjs/builders")
const { MessageEmbed } = require("discord.js")
const t = require("i18next").t.bind(require("i18next"))

module.exports = {
    data: new SlashCommandBuilder()
        .setName("openclassrooms")
        .setDescription("Explain why you should avoid OpenClassrooms courses in general"),
    guildOnly: false,

    async execute(bot, interaction) {
        const linksEmbed = new MessageEmbed()
            .setTitle(t("careful_with_openclassrooms"))
            .setDescription(t("openclassrooms_explanation"))
            .setThumbnail("https://upload.wikimedia.org/wikipedia/fr/0/0d/Logo_OpenClassrooms.png")
            .setColor("#AA44FF")
            .setFooter({ text: t("common:request_from", { username: interaction.user.username }), iconURL: interaction.user.displayAvatarURL() })

        interaction.reply({ embeds: [linksEmbed] })
    }
}