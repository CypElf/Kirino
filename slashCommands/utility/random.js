const { SlashCommandBuilder } = require("@discordjs/builders")
const t = require("i18next").t.bind(require("i18next"))

module.exports = {
    data: new SlashCommandBuilder()
        .setName("random")
        .setDescription("Generate a random number in the given range")
        .addIntegerOption(option => option.setName("minimum").setDescription("The lower bound").setRequired(true))
        .addIntegerOption(option => option.setName("maximum").setDescription("The upper bound").setRequired(true)),
    guildOnly: false,
    cooldown: 1,

    async execute(bot, interaction) {
        const min = interaction.options.getInteger("minimum")
        const max = interaction.options.getInteger("maximum")

        if (min >= max) return interaction.reply({ content: `${t("min_greater_than_max")} ${t("common:kirino_pout")}`, ephemeral: true })

        interaction.reply(`${t("random_number")} ${Math.floor(Math.random() * (max - min + 1) + min)}. ${t("common:kirino_glad")}`)
    }
}