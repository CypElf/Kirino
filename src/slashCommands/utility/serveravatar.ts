const { SlashCommandBuilder } = require("@discordjs/builders")

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