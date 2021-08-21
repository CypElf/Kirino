const { SlashCommandBuilder } = require("@discordjs/builders")
const t = require("i18next").t.bind(require("i18next"))

module.exports = {
    data: new SlashCommandBuilder()
        .setName("avatar")
        .setDescription("Display the avatar of a user")
        .addUserOption(option => option.setName("user").setDescription("The user you want to get the avatar")),
    guildOnly: false,

    async execute(bot, interaction) {
        const user = interaction.options.getUser("user") ?? interaction.user

        interaction.reply(user.displayAvatarURL({
            dynamic: true,
            size: 4096
        }))
    }
}