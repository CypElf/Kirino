import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js"
import { md5 } from "js-md5"
import { KirinoCommand, Kirino } from "../../lib/misc/types"
import { t } from "../../lib/misc/i18n"

export const command: KirinoCommand = {
    builder: new SlashCommandBuilder()
        .setName("md5")
        .setDescription("Hash the specified text with the MD5 algorithm")
        .addStringOption(option => option.setName("text").setDescription("The text you want to get the hash").setRequired(true)),

    async execute(bot: Kirino, interaction: ChatInputCommandInteraction) {
        const plaintext = interaction.options.getString("text") as string
        if (plaintext.length > 1024) return interaction.reply({ content: t("less_or_equal_to_1024"), ephemeral: true })

        const hash = md5.create().update(plaintext).hex().toUpperCase()

        const baseEmbed = new EmbedBuilder()
            .setTitle(t("md5_hashing"))
            .setThumbnail("https://cdn.discordapp.com/attachments/714381484617891980/720180307063472179/md5.png")
            .setColor("#559955")
            .addFields(
                { name: t("original_message"), value: plaintext },
                { name: t("hash"), value: hash }
            )
            .setFooter({ text: t("common:request_from", { username: interaction.user.username }), iconURL: interaction.user.displayAvatarURL() })

        interaction.reply({ embeds: [baseEmbed] })
    }
}