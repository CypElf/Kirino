const { SlashCommandBuilder } = require("@discordjs/builders")
const t = require("i18next").t.bind(require("i18next"))

module.exports = {
    data: new SlashCommandBuilder()
        .setName("about")
        .setDescription("Give some informations about me"),
    guildOnly: false,

    async execute(bot, interaction) {
        interaction.reply(`${t("about_me", { bot_name: bot.user.username })} ${t("common:kirino_glad")}`)
    }
}