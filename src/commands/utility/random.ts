import { SlashCommandBuilder } from "@discordjs/builders"
import { ChatInputCommandInteraction } from "discord.js"
import i18next from "i18next"
import { KirinoCommand, Kirino } from "../../lib/misc/types"
import { error, success } from "../../lib/misc/format"

const t = i18next.t.bind(i18next)

export const command: KirinoCommand = {
    builder: new SlashCommandBuilder()
        .setName("random")
        .setDescription("Generate a random number in the given range")
        .addIntegerOption(option => option.setName("minimum").setDescription("The lower bound").setRequired(true))
        .addIntegerOption(option => option.setName("maximum").setDescription("The upper bound").setRequired(true)),

    async execute(bot: Kirino, interaction: ChatInputCommandInteraction) {
        const min = interaction.options.getInteger("minimum") as number
        const max = interaction.options.getInteger("maximum") as number

        if (min >= max) return interaction.reply({ content: error(t("min_greater_than_max")), ephemeral: true })

        interaction.reply(success(`${t("random_number")} ${Math.floor(Math.random() * (max - min + 1) + min)}.`))
    }
}