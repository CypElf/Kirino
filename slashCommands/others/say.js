const { SlashCommandBuilder } = require("@discordjs/builders")
const { Permissions } = require("discord.js")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("say")
        .setDescription(__("description_say"))
        .addStringOption(option => option.setName("message").setDescription("The text content you want me to send as a message").setRequired(true)),
    guildOnly: true,
    permissions: ["administrator"],

    async execute(bot, interaction) {
        const text = interaction.options.getString("message")

        if (interaction.user.id !== process.env.OWNER_ID && !interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
            return interaction.reply({ content: `${__("not_allowed_to_use_this_command")} ${__("kirino_pff")}`, ephemeral: true })
        }

        await interaction.channel.send(text)
        interaction.reply({ content: `${__("say_success")} ${__("kirino_glad")}`, ephemeral: true })
    }
}