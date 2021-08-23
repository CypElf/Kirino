const { SlashCommandBuilder } = require("@discordjs/builders")
const { Permissions } = require("discord.js")
const t = require("i18next").t.bind(require("i18next"))

module.exports = {
    data: new SlashCommandBuilder()
        .setName("purge")
        .setDescription("Delete the specified amount of messages from the last messages in the current channel")
        .addIntegerOption(option => option.setName("amount_of_messages").setDescription("The number of messages you want to delete").setRequired(true)),
    guildOnly: true,
    permissions: ["manage messages"],

    async execute(bot, interaction) {
        if (!interaction.member.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES)) {
            return interaction.reply({ content: `${t("you_cannot_delete_messages")} ${t("common:kirino_pff")}`, ephemeral: true })
        }

        const count = interaction.options.getInteger("amount_of_messages") + 1

        if (count <= 0) return interaction.reply({ content: `${t("please_insert_positive_integer")} ${t("common:kirino_pout")}`, ephemeral: true })

        try {
            await interaction.channel.bulkDelete(count)
            interaction.reply({ content: `${t("purge_success")} ${t("common:kirino_glad")}`, ephemeral: true })
        }
        catch {
            interaction.reply({ content: `${t("purge_does_not_work_beyond_14_days")} ${t("common:kirino_pout")}`, ephemeral: true })
        }
    }
}