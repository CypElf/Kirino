const { SlashCommandBuilder } = require("@discordjs/builders")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("about")
        .setDescription(__("description_about")),
    guildOnly: false,

    async execute(bot, interaction) {
        interaction.reply(`${__("about_first_part") + bot.user.username + __("remaining_about")} ${__("kirino_glad")}`)
    }
}