const { SlashCommandBuilder } = require("@discordjs/builders")
const { MessageEmbed } = require("discord.js")
const t = require("i18next").t.bind(require("i18next"))

module.exports = {
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Give you some ways to get help if you need it"),
    guildOnly: false,

    async execute(bot, interaction) {
        const helpEmbed = new MessageEmbed()
            .setTitle(`**${t("help")}**`)
            .setThumbnail("https://media.discordapp.net/attachments/714381484617891980/878930768959799326/help.png")
            .addField(`**${t("q_and_a")}**\n\u200b`, t("q_and_a_content"))
            .setColor("#DFC900")
            .setFooter(t("common:request_from", { username: interaction.user.username }), interaction.user.displayAvatarURL())

        interaction.reply({ embeds: [helpEmbed] })
    }
}