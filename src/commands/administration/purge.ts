import { SlashCommandBuilder, ChatInputCommandInteraction, TextChannel, PermissionFlagsBits } from "discord.js"
import { KirinoCommand, Kirino } from "../../lib/misc/types"
import { error, success } from "../../lib/misc/format"
import { t } from "../../lib/misc/i18n"

export const command: KirinoCommand = {
    builder: new SlashCommandBuilder()
        .setName("purge")
        .setDescription("Delete the specified amount of messages from the last messages in the current channel")
        .addIntegerOption(option => option.setName("amount_of_messages").setDescription("The number of messages you want to delete").setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .setDMPermission(false),

    async execute(bot: Kirino, interaction: ChatInputCommandInteraction) {
        const count = interaction.options.getInteger("amount_of_messages") as number

        if (count <= 0) return interaction.reply({ content: error(t("please_insert_positive_integer")), ephemeral: true })

        try {
            const channel = interaction.channel as TextChannel
            await channel.bulkDelete(count)
            interaction.reply({ content: success(t("purge_success")), ephemeral: true })
        }
        catch {
            interaction.reply({ content: success(t("purge_does_not_work_beyond_14_days")), ephemeral: true })
        }
    }
}