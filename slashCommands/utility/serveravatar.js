const { SlashCommandBuilder } = require("@discordjs/builders")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("serveravatar")
        .setDescription(__("description_serverpicture")),
    guildOnly: true,

    async execute(bot, interaction) {
        interaction.reply(interaction.guild.iconURL({
            dynamic: true,
            size: 4096
        }))
    }
}