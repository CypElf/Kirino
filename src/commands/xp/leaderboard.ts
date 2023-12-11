import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js"
import i18next from "i18next"
import { KirinoCommand, Kirino } from "../../lib/misc/types"
import { error, success } from "../../lib/misc/format"
import { XpGuild } from "../../lib/misc/database"

const t = i18next.t.bind(i18next)

export const command: KirinoCommand = {
    builder: new SlashCommandBuilder()
        .setName("leaderboard")
        .setDescription("Give you this server's XP leaderboard link")
        .addIntegerOption(option => option.setName("page").setDescription("The page of the leaderboard you want to open"))
        .addIntegerOption(option => option.setName("limit").setDescription("The number of players to list in the page"))
        .setDMPermission(false),

    async execute(bot: Kirino, interaction: ChatInputCommandInteraction) {
        const isEnabled = (bot.db.prepare("SELECT is_enabled FROM xp_guilds WHERE guild_id = ?").get(interaction.guild?.id) as XpGuild | null)?.is_enabled
        if (!isEnabled) return interaction.reply({ content: error(t("xp_disabled")), ephemeral: true })

        const page = interaction.options.getInteger("page")
        const limit = interaction.options.getInteger("limit")
        const params = (page ? `/${page}` : "") + (limit ? `/${limit}` : "")

        const lang = i18next.language === "fr" ? "/fr" : ""
        interaction.reply(success(`${t("leaderboard_of")}${interaction.guild?.name}${t("is_available_at")} https://kirino.xyz${lang}/leaderboards/${interaction.guild?.id}${params}`))
    }
}