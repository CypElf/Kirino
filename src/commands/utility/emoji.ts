import { SlashCommandBuilder } from "@discordjs/builders"
import { ChatInputCommandInteraction } from "discord.js"
import i18next from "i18next"
import { KirinoCommand, Kirino } from "../../lib/misc/types"

const t = i18next.t.bind(i18next)

export const command: KirinoCommand = {
    builder: new SlashCommandBuilder()
        .setName("emoji")
        .setDescription("Display the image used for an emoji")
        .addStringOption(option => option.setName("emoji").setDescription("The emoji you want to get the image").setRequired(true)),
    guildOnly: false,

    async execute(bot: Kirino, interaction: ChatInputCommandInteraction) {
        const raw = interaction.options.getString("emoji") as string

        let emoji = raw.match(/<:(.*?):[0-9]*>/gm)
        let extension = "png"

        if (!emoji) {
            emoji = raw.match(/<a:(.*?):[0-9]*>/gm)
            extension = "gif"
        }

        if (!emoji) return interaction.reply({ content: t("specify_custom_emojis"), ephemeral: true })

        const emojiId = emoji.toString().split(":")[2].split(">").slice(0, -1).join(">")

        interaction.reply(`https://cdn.discordapp.com/emojis/${emojiId}.${extension}`)
    }
}