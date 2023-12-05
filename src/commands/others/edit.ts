import { SlashCommandBuilder } from "@discordjs/builders"
import { ChatInputCommandInteraction, GuildMember, PermissionFlagsBits } from "discord.js"
import i18next from "i18next"
import { KirinoCommand, Kirino } from "../../lib/misc/types"
import { denied, error, success } from "../../lib/misc/format"

const t = i18next.t.bind(i18next)

export const command: KirinoCommand = {
    builder: new SlashCommandBuilder()
        .setName("edit")
        .setDescription("Edit a message I sent")
        .addStringOption(option => option.setName("message_id").setDescription("The ID of the message you want me to edit").setRequired(true))
        .addStringOption(option => option.setName("new_message").setDescription("The new content you want to be written in the message").setRequired(true)),
    guildOnly: true,

    async execute(bot: Kirino, interaction: ChatInputCommandInteraction) {
        const member = interaction.member as GuildMember | null
        if (interaction.user.id !== process.env.OWNER_ID && member && !member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({ content: denied(t("not_allowed_to_use_this_command")), ephemeral: true })
        }

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