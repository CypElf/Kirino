import { SlashCommandBuilder } from "@discordjs/builders"
import { ChatInputCommandInteraction } from "discord.js"
import i18next from "i18next"
import { Kirino } from "../../lib/misc/types"

const t = i18next.t.bind(i18next)

export const command = {
    data: new SlashCommandBuilder()
        .setName("dontasktoask")
        .setDescription("Explain why should explain your issue instead of saying no more than you have an issue"),
    guildOnly: false,

    async execute(bot: Kirino, interaction: ChatInputCommandInteraction) {
        interaction.reply(`${t("dont")}\nhttps://dontasktoask.com/`)
    }
}