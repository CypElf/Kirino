const { SlashCommandBuilder } = require("@discordjs/builders")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("leaderboard")
        .setDescription(__("description_leaderboard"))
        .addIntegerOption(option => option.setName("page").setDescription("The page of the leaderboard you want to open"))
        .addIntegerOption(option => option.setName("limit").setDescription("The number of players to list in the page"))
    ,
    guildOnly: true,

    async execute(bot, interaction) {
        const xpActivationRequest = bot.db.prepare("SELECT is_enabled FROM xp_guilds WHERE guild_id = ?")
        let isEnabled = xpActivationRequest.get(interaction.guild.id)
        if (isEnabled) isEnabled = isEnabled.is_enabled
        if (!isEnabled) return interaction.reply({ content: `${__("currently_disabled_enable_with")} \`${bot.prefix}xp enable\`.`, ephemeral: true })

        const page = interaction.options.getInteger("page")
        const limit = interaction.options.getInteger("limit")
        const params = (page ? `/${page}` : "") + (limit ? `/${limit}` : "")

        const lang = getLocale() === "fr" ? "/fr" : ""
        interaction.reply(`${__("leaderboard_of")}${interaction.guild.name}${__("is_available_at")} https://kirino.xyz${lang}/leaderboards/${interaction.guild.id}${params} ${__("kirino_glad")}`)
    }
}