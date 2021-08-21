const { SlashCommandBuilder } = require("@discordjs/builders")
const t = require("i18next").t.bind(require("i18next"))

module.exports = {
    data: new SlashCommandBuilder()
        .setName("support")
        .setDescription("Display my support's server invitation link"),
    guildOnly: false,
    cooldown: 1,

    async execute(bot, interaction) {
        interaction.reply("https://discord.gg/NNAGZCz")
    }
}