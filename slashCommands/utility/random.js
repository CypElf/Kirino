const { SlashCommandBuilder } = require("@discordjs/builders")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("random")
        .setDescription(__("description_random"))
        .addIntegerOption(option => option.setName("minimum").setDescription("The lower bound").setRequired(true))
        .addIntegerOption(option => option.setName("maximum").setDescription("The upper bound").setRequired(true)),
    guildOnly: false,
    cooldown: 1,

    async execute(bot, interaction) {
        const min = interaction.options.getInteger("minimum")
        const max = interaction.options.getInteger("maximum")

        if (min >= max) return interaction.reply({ content: `${__("min_greater_than_max")} ${__("kirino_pout")}`, ephemeral: true })

        interaction.reply(`${__("random_number")} ${Math.floor(Math.random() * (max - min + 1) + min)}. ${__("kirino_glad")}`)
    }
}