import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits } from "discord.js"
import { KirinoCommand, Kirino } from "../../lib/misc/types"
import { denied, error, success } from "../../lib/misc/format"
import { t } from "../../lib/misc/i18n"

export const command: KirinoCommand = {
    builder: new SlashCommandBuilder()
        .setName("edit")
        .setDescription("Edit a message I sent")
        .addStringOption(option => option.setName("message_id").setDescription("The ID of the message you want me to edit").setRequired(true))
        .addStringOption(option => option.setName("new_message").setDescription("The new content you want to be written in the message").setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .setDMPermission(false),

    async execute(bot: Kirino, interaction: ChatInputCommandInteraction) {
        const message_id = interaction.options.getString("message_id") as string
        const new_message = interaction.options.getString("new_message") as string

        try {
            if (!interaction.channel) return
            const msg = await interaction.channel.messages.fetch(message_id)

            if (!msg.editable) {
                return interaction.reply({ content: denied(t("cannot_edit_this_message")), ephemeral: true })
            }

            msg.edit(new_message)
            interaction.reply({ content: success(t("message_edited")), ephemeral: true })
        }
        catch {
            interaction.reply({ content: error(t("bad_message_id")), ephemeral: true })
        }
    }
}