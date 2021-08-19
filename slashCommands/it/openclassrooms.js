const { SlashCommandBuilder } = require("@discordjs/builders")
const { MessageEmbed } = require("discord.js")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("openclassrooms")
        .setDescription(__("description_openclassrooms")),
    guildOnly: false,

    async execute(bot, interaction) {
        const linksEmbed = new MessageEmbed()
            .setTitle(__("careful_with_openclassrooms"))
            .setDescription(__("openclassrooms_explanation"))
            .setThumbnail("https://upload.wikimedia.org/wikipedia/fr/0/0d/Logo_OpenClassrooms.png")
            .setColor("#AA44FF")
            .setFooter(__("request_from") + interaction.user.username, interaction.user.displayAvatarURL())

        interaction.reply({ embeds: [linksEmbed] })
    }
}