import { SlashCommandBuilder } from "@discordjs/builders"
import { ChatInputCommandInteraction } from "discord.js"
import i18next from "i18next"
import { Kirino } from "../../lib/misc/types"
import { success, what } from "../../lib/misc/format"

const t = i18next.t.bind(i18next)

export const command = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Display my ping in milliseconds"),
    guildOnly: false,
    cooldown: 1,

    async execute(bot: Kirino, interaction: ChatInputCommandInteraction) {
        const start = Date.now()
        await interaction.reply(what("ping"))
        interaction.editReply(success("pong") + ` (${Date.now() - start} ms)`)
    }
}