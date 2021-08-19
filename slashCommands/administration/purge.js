const { SlashCommandBuilder } = require("@discordjs/builders")
const { Permissions } = require("discord.js")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("purge")
        .setDescription(__("description_purge"))
        .addIntegerOption(option => option.setName("messages_count").setDescription("The number of messages you want to delete").setRequired(true)),
    guildOnly: true,
    permissions: ["manage messages"],

    async execute(bot, interaction) {
        if (!interaction.member.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES)) {
            return interaction.reply({ content: `${__("you_cannot_delete_messages")} ${__("kirino_pff")}`, ephemeral: true })
        }

        const count = interaction.options.getInteger("messages_count") + 1

        if (count <= 0) return interaction.reply({ content: `${__("please_insert_positive_integer")} ${__("kirino_pout")}`, ephemeral: true })

        try {
            await interaction.channel.bulkDelete(count)
            interaction.reply({ content: `${__("purge_success")} ${__("kirino_glad")}`, ephemeral: true })
        }
        catch {
            interaction.reply({ content: `${__("purge_does_not_work_beyond_14_days")} ${__("kirino_pout")}`, ephemeral: true })
        }
    }
}