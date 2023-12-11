import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js"
import { KirinoCommand, Kirino } from "../../lib/misc/types"
import { t } from "../../lib/misc/i18n"

export const command: KirinoCommand = {
    builder: new SlashCommandBuilder()
        .setName("base")
        .setDescription("Perform a base (radix) conversion")
        .addStringOption(option => option.setName("number").setDescription("The number you want to convert").setRequired(true))
        .addIntegerOption(option => option.setName("current_base").setDescription("The current base of the number you want to convert").setRequired(true))
        .addIntegerOption(option => option.setName("new_base").setDescription("The base you want the number to be converted to").setRequired(true)),

    async execute(bot: Kirino, interaction: ChatInputCommandInteraction) {
        const number = interaction.options.getString("number") as string
        const inputBase = interaction.options.getInteger("current_base") as number
        const outputBase = interaction.options.getInteger("new_base") as number

        if (inputBase < 2 || inputBase > 36 || outputBase < 2 || outputBase > 36) {
            return interaction.reply({ content: t("base_out_of_range"), ephemeral: true })
        }

        const convertedToDecimal = parseInt(number, inputBase)
        if (isNaN(convertedToDecimal)) return interaction.reply({ content: t("bad_number"), ephemeral: true })

        const convertedToOutputBase = convertedToDecimal.toString(outputBase)

        const baseEmbed = new EmbedBuilder()
            .setTitle(t("numeric_base_conversion"))
            .setThumbnail("https://cdn.discordapp.com/attachments/714381484617891980/720178440078229554/binary_flat.png")
            .setColor("#000000")
            .addFields(
                { name: `${t("original_number_in_base")} ${inputBase}`, value: `**${number}**` },
                { name: `${t("converted_number_in_base")} ${outputBase}`, value: `**${convertedToOutputBase}**` }
            )
            .setFooter({ text: t("common:request_from", { username: interaction.user.username }), iconURL: interaction.user.displayAvatarURL() })

        interaction.reply({ embeds : [baseEmbed] })
    }
}