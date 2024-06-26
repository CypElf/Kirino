import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js"
import { KirinoCommand, Kirino } from "../../lib/misc/types"
import { error } from "../../lib/misc/format"
import { t } from "../../lib/misc/i18n"

export const command: KirinoCommand = {
    builder: new SlashCommandBuilder()
        .setName("invite")
        .setDescription("Give you the link to invite me to a new Discord server"),

    async execute(bot: Kirino, interaction: ChatInputCommandInteraction) {
        if (!process.env.INVITE_LINK) {
            return interaction.reply({ content: error(t("invite_link_not_available")), ephemeral: true })
        }

        const invite = new EmbedBuilder()
            .addFields({ name: `${t("invite_bot")} **${bot.user?.username}** ${t("on_a_server")}`, value: `${t("the_link_to_invite_me_is_available")} **${t("here")}(${process.env.INVITE_LINK})**` })
            .setColor("#DFC900")
            .setFooter({ text: t("common:request_from", { username: interaction.user.username }), iconURL: interaction.user.avatarURL()?.toString() })

        interaction.reply({ embeds: [invite] })
    }
}