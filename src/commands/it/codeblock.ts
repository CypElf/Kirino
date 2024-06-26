import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js"
import { KirinoCommand, Kirino } from "../../lib/misc/types"
import { t } from "../../lib/misc/i18n"

export const command: KirinoCommand = {
    builder: new SlashCommandBuilder()
        .setName("codeblock")
        .setDescription("Tell you how to send a block of code with appropriate syntax highlighting on Discord"),

    async execute(bot: Kirino, interaction: ChatInputCommandInteraction) {
        const linksEmbed = new EmbedBuilder()
            .setTitle(t("send_code"))
            .setDescription(t("explanation_code"))
            .setThumbnail("https://cdn.discordapp.com/attachments/698105563485044748/712574232147656704/712320080884793537.png")
            .setImage("https://cdn.discordapp.com/attachments/698105563485044748/712577943666294814/unknown.png")
            .setColor("#000000")
            .setFooter({ text: t("common:request_from", { username: interaction.user.username }), iconURL: interaction.user.displayAvatarURL() })

        interaction.reply({ embeds: [linksEmbed] })
    }
}