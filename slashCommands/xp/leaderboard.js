const { SlashCommandBuilder } = require("@discordjs/builders")
const i18next = require("i18next")
const t = i18next.t.bind(i18next)

module.exports = {
    data: new SlashCommandBuilder()
        .setName("leaderboard")
        .setDescription("Give you this server's XP leaderboard link")
        .addIntegerOption(option => option.setName("page").setDescription("The page of the leaderboard you want to open"))
        .addIntegerOption(option => option.setName("limit").setDescription("The number of players to list in the page")),
    guildOnly: true,

    async execute(bot, interaction) {
        const xpActivationRequest = bot.db.prepare("SELECT is_enabled FROM xp_guilds WHERE guild_id = ?")
        let isEnabled = xpActivationRequest.get(interaction.guild.id)
        if (isEnabled) isEnabled = isEnabled.is_enabled
        if (!isEnabled) return interaction.reply({ content: `${t("currently_disabled_enable_with")} \`${bot.prefix}xp enable\`.`, ephemeral: true })

        const page = interaction.options.getInteger("page")
        const limit = interaction.options.getInteger("limit")
        const params = (page ? `/${page}` : "") + (limit ? `/${limit}` : "")

        const lang = i18next.language === "fr" ? "/fr" : ""
        interaction.reply(`${t("leaderboard_of")}${interaction.guild.name}${t("is_available_at")} https://kirino.xyz${lang}/leaderboards/${interaction.guild.id}${params} ${t("common:kirino_glad")}`)
    }
}