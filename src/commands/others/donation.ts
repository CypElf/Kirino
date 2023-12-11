import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js"
import getOwnerAvatar from "../../lib/misc/get_owner_avatar"
import { KirinoCommand, Kirino } from "../../lib/misc/types"
import { t } from "../../lib/misc/i18n"

export const command: KirinoCommand = {
    builder: new SlashCommandBuilder()
        .setName("donation")
        .setDescription("Display my developer's paypal if you want to support me by donating"),

    async execute(bot: Kirino, interaction: ChatInputCommandInteraction) {
        const donationEmbed = new EmbedBuilder()
            .addFields({ name: t("make_donation_title"), value: t("make_donation") + "(https://www.paypal.me/cypelf)." })
            .setColor("#DFC900")
            .setFooter({ text: t("common:request_from", { username: interaction.user.username }), iconURL: interaction.user.displayAvatarURL() })

        const ownerAvatar = getOwnerAvatar(bot)
        if (ownerAvatar) donationEmbed.setThumbnail(ownerAvatar)

        interaction.reply({ embeds: [donationEmbed] })
    }
}