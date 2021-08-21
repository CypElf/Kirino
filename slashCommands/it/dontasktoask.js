const { SlashCommandBuilder } = require("@discordjs/builders")
const t = require("i18next").t.bind(require("i18next"))

module.exports = {
    data: new SlashCommandBuilder()
        .setName("dontasktoask")
        .setDescription("Explain why should explain your issue instead of saying no more than you have an issue"),
    guildOnly: false,

    async execute(bot, interaction) {
        interaction.reply(`${t("dont")}\nhttps://dontasktoask.com/`)
    }
}