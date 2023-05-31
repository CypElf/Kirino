import { SlashCommandBuilder } from "@discordjs/builders"
import { CommandInteraction, MessageEmbed } from "discord.js"
import i18next from "i18next"
import { Kirino } from "../../lib/misc/types"

const t = i18next.t.bind(i18next)

export const command = {
    data: new SlashCommandBuilder()
        .setName("rot13")
        .setDescription("Encode your text with ROT13 (shift of 13 letters in the alphabet)")
        .addStringOption(option => option.setName("text").setDescription("The text you want to encode").setRequired(true))
        .addIntegerOption(option => option.setName("shift").setDescription("The shift you want to use (default: 13)")),
    guildOnly: false,

    async execute(bot: Kirino, interaction: CommandInteraction) {
        const plaintext = interaction.options.getString("text") as string
        const shift = interaction.options.getNumber("shift") ?? 13

        if (plaintext.length > 1024) return interaction.reply({ content: t("less_or_equal_to_1024"), ephemeral: true })

        const encrypted = ROT13(plaintext, shift)

        const baseEmbed = new MessageEmbed()
            .setTitle("ROT13")
            .setThumbnail("https://cdn.discordapp.com/attachments/698105563195768846/720184508514828318/rot13.png")
            .setColor("#555599")
            .addFields(
                { name: t("original_message"), value: plaintext },
                { name: t("encoded_message"), value: encrypted }
            )
            .setFooter({ text: t("common:request_from", { username: interaction.user.username }), iconURL: interaction.user.displayAvatarURL() })

        interaction.reply({ embeds: [baseEmbed] })
    }
}

function ROT13(str: string, shift: number) {
    const lowercase = "abcdefghijklmnopqrstuvwxyz"
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

    return str
        .split("")
        .map((s) => lowercase.includes(s) ? lowercase[(lowercase.indexOf(s) + shift) % 26] : s)
        .map((s) => uppercase.includes(s) ? uppercase[(uppercase.indexOf(s) + shift) % 26] : s)
        .join("")
}