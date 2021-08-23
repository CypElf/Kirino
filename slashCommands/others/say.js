const { SlashCommandBuilder } = require("@discordjs/builders")
const { Permissions } = require("discord.js")
const t = require("i18next").t.bind(require("i18next"))

module.exports = {
    data: new SlashCommandBuilder()
        .setName("say")
        .setDescription("Make me say something")
        .addStringOption(option => option.setName("message").setDescription("The text content you want me to send as a message").setRequired(true)),
    guildOnly: true,
    permissions: ["administrator"],

    async execute(bot, interaction) {
        const text = interaction.options.getString("message")

        if (interaction.user.id !== process.env.OWNER_ID && !interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
            return interaction.reply({ content: `${t("not_allowed_to_use_this_command")} ${t("common:kirino_pff")}`, ephemeral: true })
        }

        await interaction.channel.send(text)
        interaction.reply({ content: `${t("say_success")} ${t("common:kirino_glad")}`, ephemeral: true })
    }
}