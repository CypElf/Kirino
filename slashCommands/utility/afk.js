const { SlashCommandBuilder } = require("@discordjs/builders")
const t = require("i18next").t.bind(require("i18next"))

module.exports = {
    data: new SlashCommandBuilder()
        .setName("afk")
        .setDescription("Allow you to leave a message for those who mention you while you're AFK")
        .addStringOption(option => option.setName("reason").setDescription("The reason why you're AFK")),
    guildOnly: true,

    async execute(bot, interaction) {
        const reason = interaction.options.getString("reason")

        if (reason && reason.length > 1800) {
            return interaction.reply({ content: `${t("afk_reason_too_long")} ${t("common:kirino_pout")}`, ephemeral: true })
        }

        bot.db.prepare("INSERT INTO afk(user_id, reason) VALUES(?, ?)").run(interaction.user.id, reason)

        if (reason) {
            return interaction.reply(`${t("added_to_afk_with_reason")} ${t("common:kirino_glad")} : ${reason}`)
        }
        else {
            return interaction.reply(`${t("added_to_afk_without_reason")} ${t("common:kirino_glad")}`)
        }
    }
}