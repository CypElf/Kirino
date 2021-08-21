const { SlashCommandBuilder } = require("@discordjs/builders")
const { MessageEmbed } = require("discord.js")
const t = require("i18next").t.bind(require("i18next"))

module.exports = {
    data: new SlashCommandBuilder()
        .setName("donation")
        .setDescription("Display my developer's paypal if you want to support me by donating"),
    guildOnly: false,

    async execute(bot, interaction) {
        const donationEmbed = new MessageEmbed()
            .addField(t("make_donation_title"), t("make_donation") + "(https://www.paypal.me/cypelf).")
            .setColor("#DFC900")
            .setThumbnail("https://cdn.discordapp.com/attachments/689424377770541071/699210423290953838/Logo.jpg")
            .setFooter(t("request_from") + interaction.user.username, interaction.user.displayAvatarURL())

        interaction.reply({ embeds: [donationEmbed] })
    }
}