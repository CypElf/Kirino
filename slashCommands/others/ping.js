const { SlashCommandBuilder } = require("@discordjs/builders")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription(__("description_ping")),
    guildOnly: false,
    cooldown: 1,

    async execute(bot, interaction) {
        const start = Date.now()
        await interaction.reply(`ping ${__("kirino_what")}`)
        interaction.editReply(`pong ${__("kirino_glad")} (${Date.now() - start} ms)`)
    }
}