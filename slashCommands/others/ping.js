const { SlashCommandBuilder } = require("@discordjs/builders")
const t = require("i18next").t.bind(require("i18next"))

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Display my ping in milliseconds"),
    guildOnly: false,
    cooldown: 1,

    async execute(bot, interaction) {
        const start = Date.now()
        await interaction.reply(`ping ${t("common:kirino_what")}`)
        interaction.editReply(`pong ${t("common:kirino_glad")} (${Date.now() - start} ms)`)
    }
}