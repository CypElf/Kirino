import { SlashCommandBuilder } from "@discordjs/builders"
import { CommandInteraction, GuildMember, Permissions } from "discord.js"
import i18next from "i18next"
import { Kirino } from "../../lib/misc/types"

const t = i18next.t.bind(i18next)

export default {
    data: new SlashCommandBuilder()
        .setName("edit")
        .setDescription("Edit a message I sent")
        .addStringOption(option => option.setName("message_id").setDescription("The ID of the message you want me to edit").setRequired(true))
        .addStringOption(option => option.setName("new_message").setDescription("The new content you want to be written in the message").setRequired(true)),
    guildOnly: true,

    async execute(bot: Kirino, interaction: CommandInteraction) {
        const member = interaction.member as GuildMember | null
        if (interaction.user.id !== process.env.OWNER_ID && member && !member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
            return interaction.reply({ content: t("not_allowed_to_use_this_command") + " " + t("common:kirino_pff"), ephemeral: true })
        }

        const message_id = interaction.options.getString("message_id") as string
        const new_message = interaction.options.getString("new_message") as string

        try {
            if (!interaction.channel) return
            const msg = await interaction.channel.messages.fetch(message_id)

            if (!msg.editable) {
                return interaction.reply({ content: `${t("cannot_edit_this_message")} ${t("common:kirino_pff")}`, ephemeral: true })
            }

            msg.edit(new_message)
            interaction.reply({ content: `${t("message_edited")} ${t("common:kirino_glad")}`, ephemeral: true })
        }
        catch {
            interaction.reply({ content: `${t("bad_message_id")} ${t("common:kirino_pout")}`, ephemeral: true })
        }
    }
}