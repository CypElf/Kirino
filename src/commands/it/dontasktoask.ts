import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js"
import { KirinoCommand, Kirino } from "../../lib/misc/types"
import { t } from "../../lib/misc/i18n"

export const command: KirinoCommand = {
    builder: new SlashCommandBuilder()
        .setName("dontasktoask")
        .setDescription("Explain why should explain your issue instead of saying no more than you have an issue"),

    async execute(bot: Kirino, interaction: ChatInputCommandInteraction) {
        interaction.reply(`${t("dont")}\nhttps://dontasktoask.com/`)
    }
}