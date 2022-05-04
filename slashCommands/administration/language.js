const { SlashCommandBuilder } = require("@discordjs/builders")
const { Permissions } = require("discord.js")
const i18next = require("i18next")
const t = i18next.t.bind(i18next)

module.exports = {
    data: new SlashCommandBuilder()
        .setName("language")
        .setDescription("Allow you to change the language I use for all my commands")
        .addStringOption(option => option.setName("language")
            .setDescription("The new language you want to set")
            .setRequired(true)
            .addChoices({
                name: "English",
                value: "en"
            }, {
                name: "Français",
                value: "fr"
            })),
    guildOnly: false,
    cooldown: 3,
    permissions: ["manage guild"],

    async execute(bot, interaction) {
        const isInGuild = interaction.inGuild()

        if (isInGuild) {
            if (!interaction.member.permissions.has(Permissions.FLAGS.MANAGE_GUILD)) {
                return interaction.reply({ content: `${t("not_enough_permission_to_change_language")} ${t("common:kirino_pout")}`, ephemeral: true })
            }
        }

        const language = interaction.options.getString("language")

        const id = isInGuild ? interaction.guild.id : interaction.user.id
        bot.db.prepare("INSERT INTO languages(id, language) VALUES(?,?) ON CONFLICT(id) DO UPDATE SET language = excluded.language").run(id, language)

        await i18next.changeLanguage(language)

        if (isInGuild) {
            interaction.reply(`${t("server_language_changed") + language}\` ${t("common:kirino_glad")} !`)
        }
        else {
            interaction.reply(`${t("dm_language_changed") + language}\` ${t("common:kirino_glad")} !`)
        }
    }
}