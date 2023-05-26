import { SlashCommandBuilder } from "@discordjs/builders"
import { CommandInteraction } from "discord.js"
import i18next from "i18next"
import { Kirino } from "../../lib/misc/types"

const t = i18next.t.bind(i18next)

export const command = {
    data: new SlashCommandBuilder()
        .setName("random")
        .setDescription("Generate a random number in the given range")
        .addIntegerOption(option => option.setName("minimum").setDescription("The lower bound").setRequired(true))
        .addIntegerOption(option => option.setName("maximum").setDescription("The upper bound").setRequired(true)),
    guildOnly: false,
    cooldown: 1,

    async execute(bot: Kirino, interaction: CommandInteraction) {
        const min = interaction.options.getInteger("minimum") as number
        const max = interaction.options.getInteger("maximum") as number

        if (min >= max) return interaction.reply({ content: `${t("min_greater_than_max")} ${t("common:kirino_pout")}`, ephemeral: true })

        interaction.reply(`${t("random_number")} ${Math.floor(Math.random() * (max - min + 1) + min)}. ${t("common:kirino_glad")}`)
    }
}