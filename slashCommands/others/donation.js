const { SlashCommandBuilder } = require("@discordjs/builders")
const { MessageEmbed } = require("discord.js")
const t = require("i18next").t.bind(require("i18next"))
const getOwnerAvatar = require("../../lib/misc/get_owner_avatar")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("donation")
        .setDescription("Display my developer's paypal if you want to support me by donating"),
    guildOnly: false,

    async execute(bot, interaction) {
        const donationEmbed = new MessageEmbed()
            .addField(t("make_donation_title"), t("make_donation") + "(https://www.paypal.me/cypelf).")
            .setColor("#DFC900")
            .setFooter({ text: t("common:request_from", { username: interaction.user.username }), iconURL: interaction.user.displayAvatarURL() })

        const ownerAvatar = getOwnerAvatar(bot)
        if (ownerAvatar) donationEmbed.setThumbnail(ownerAvatar)

        interaction.reply({ embeds: [donationEmbed] })
    }
}