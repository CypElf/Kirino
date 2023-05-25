import { SlashCommandBuilder } from "@discordjs/builders"
import { CommandInteraction, MessageEmbed } from "discord.js"
import i18next from "i18next"
import getOwnerAvatar from "../../lib/misc/get_owner_avatar"
import { Kirino } from "../../lib/misc/types"

const t = i18next.t.bind(i18next)

export default {
    data: new SlashCommandBuilder()
        .setName("donation")
        .setDescription("Display my developer's paypal if you want to support me by donating"),
    guildOnly: false,

    async execute(bot: Kirino, interaction: CommandInteraction) {
        const donationEmbed = new MessageEmbed()
            .addFields({ name: t("make_donation_title"), value: t("make_donation") + "(https://www.paypal.me/cypelf)." })
            .setColor("#DFC900")
            .setFooter({ text: t("common:request_from", { username: interaction.user.username }), iconURL: interaction.user.displayAvatarURL() })

        const ownerAvatar = getOwnerAvatar(bot)
        if (ownerAvatar) donationEmbed.setThumbnail(ownerAvatar)

        interaction.reply({ embeds: [donationEmbed] })
    }
}