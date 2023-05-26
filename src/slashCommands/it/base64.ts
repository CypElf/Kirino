import { SlashCommandBuilder } from "@discordjs/builders"
import { CommandInteraction, MessageEmbed } from "discord.js"
import i18next from "i18next"
import { Kirino } from "../../lib/misc/types"

const t = i18next.t.bind(i18next)

export const command = {
    data: new SlashCommandBuilder()
        .setName("base64")
        .setDescription("Allows to encode or decode a message with base64 encoding")
        .addSubcommand(option => option.setName("encode").setDescription("Encode a text in base64").addStringOption(option => option.setName("text").setDescription("The text to encode in base64").setRequired(true)))
        .addSubcommand(option => option.setName("decode").setDescription("Decode a text from base64").addStringOption(option => option.setName("text").setDescription("The text to decode from base64").setRequired(true))),
    guildOnly: false,

    async execute(bot: Kirino, interaction: CommandInteraction) {
        const text = interaction.options.getString("text") as string
        const subcommand = interaction.options.getSubcommand()

        const base64Embed = new MessageEmbed()

        if (subcommand === "encode") {
            if (text.length > 760) {
                return interaction.reply({ content: t("message_too_long_for_encoding"), ephemeral: true })
            }

            const buffer = Buffer.from(text)
            const convertedInput = buffer.toString("base64")

            base64Embed.setTitle(t("base64_encoding"))
                .addFields(
                    { name: t("original_message"), value: text },
                    { name: t("encoded_message"), value: convertedInput }
                )
        }

        else if (subcommand === "decode") {
            if (text.length > 1024) {
                return interaction.reply({ content: t("message_too_long_for_decoding"), ephemeral: true })
            }
            const buffer = Buffer.from(text, "base64")
            const convertedInput = buffer.toString("utf8")

            base64Embed.setTitle(t("base64_decoding"))
                .addFields(
                    { name: t("encoded_message"), value: text },
                    { name: t("original_message"), value: convertedInput }
                )
        }

        base64Embed.setColor("#08857A")
            .setFooter({ text: t("common:request_from", { username: interaction.user.username }), iconURL: interaction.user.displayAvatarURL() })
            .setThumbnail("https://cdn.discordapp.com/attachments/714381484617891980/714381707842813984/base64.png")

        interaction.reply({ embeds: [base64Embed] })
    }
}