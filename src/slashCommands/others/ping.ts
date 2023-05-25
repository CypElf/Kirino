import { SlashCommandBuilder } from "@discordjs/builders"
import { CommandInteraction } from "discord.js"
import i18next from "i18next"
import { Kirino } from "../../lib/misc/types"

const t = i18next.t.bind(i18next)

export default {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Display my ping in milliseconds"),
    guildOnly: false,
    cooldown: 1,

    async execute(bot: Kirino, interaction: CommandInteraction) {
        const start = Date.now()
        await interaction.reply(`ping ${t("common:kirino_what")}`)
        interaction.editReply(`pong ${t("common:kirino_glad")} (${Date.now() - start} ms)`)
    }
}