const { SlashCommandBuilder } = require("@discordjs/builders")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("avatar")
        .setDescription(__("description_profilepicture"))
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