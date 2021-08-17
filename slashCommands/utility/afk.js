const { SlashCommandBuilder } = require("@discordjs/builders")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("afk")
        .setDescription(__("description_afk"))
        .addStringOption(option => option.setName("reason").setDescription("The reason why you're AFK")),
    guildOnly: true,

    async execute(bot, interaction) {
        const reason = interaction.options.getString("reason")

        if (reason && reason.length > 1800) {
            return interaction.reply({ content: `${__("afk_reason_too_long")} ${__("kirino_pout")}`, ephemeral: true })
        }

        bot.db.prepare("INSERT INTO afk(user_id, reason) VALUES(?, ?)").run(interaction.user.id, reason)

        if (reason) {
            return interaction.reply(`${__("added_to_afk_with_reason")} ${__("kirino_glad")} : ${reason}`)
        }
        else {
            return interaction.reply(`${__("added_to_afk_without_reason")} ${__("kirino_glad")}`)
        }
    }
}