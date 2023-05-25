import { SlashCommandBuilder } from "@discordjs/builders"
import { CommandInteraction, MessageEmbed } from "discord.js"
import i18next from "i18next"
import md5 from "js-md5"
import { Kirino } from "../../lib/misc/types"

const t = i18next.t.bind(i18next)

export default {
    data: new SlashCommandBuilder()
        .setName("md5")
        .setDescription("Hash the specified text with the MD5 algorithm")
        .addStringOption(option => option.setName("text").setDescription("The text you want to get the hash").setRequired(true)),
    guildOnly: false,

    async execute(bot: Kirino, interaction: CommandInteraction) {
        const plaintext = interaction.options.getString("text") as string
        if (plaintext.length > 1024) return interaction.reply({ content: t("less_or_equal_to_1024"), ephemeral: true })

        const hash = md5.create().update(plaintext).hex().toUpperCase()

        const baseEmbed = new MessageEmbed()
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