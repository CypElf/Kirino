const { SlashCommandBuilder } = require("@discordjs/builders")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("support")
        .setDescription(__("description_support")),
    guildOnly: false,
    cooldown: 1,

    async execute(bot, interaction) {
        interaction.reply("https://discord.gg/NNAGZCz")
    }
}