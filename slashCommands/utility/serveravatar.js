const { SlashCommandBuilder } = require("@discordjs/builders")
const t = require("i18next").t.bind(require("i18next"))

module.exports = {
    data: new SlashCommandBuilder()
        .setName("serveravatar")
        .setDescription("Display the image used for the server avatar"),
    guildOnly: true,

    async execute(bot, interaction) {
        interaction.reply(interaction.guild.iconURL({
            dynamic: true,
            size: 4096
        }))
    }
}