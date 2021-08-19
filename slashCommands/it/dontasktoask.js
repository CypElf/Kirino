const { SlashCommandBuilder } = require("@discordjs/builders")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("dontasktoask")
        .setDescription(__("description_dontasktoask")),
    guildOnly: false,

    async execute(bot, interaction) {
        interaction.reply(`${__("dont")}\nhttps://dontasktoask.com/`)
    }
}