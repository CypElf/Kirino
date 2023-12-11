import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits } from "discord.js"
import { KirinoCommand, Kirino } from "../../lib/misc/types"
import { success } from "../../lib/misc/format"
import { t } from "../../lib/misc/i18n"

export const command: KirinoCommand = {
    builder: new SlashCommandBuilder()
        .setName("say")
        .setDescription("Make me say something")
        .addStringOption(option => option.setName("message").setDescription("The text content you want me to send as a message").setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .setDMPermission(false),

    async execute(bot: Kirino, interaction: ChatInputCommandInteraction) {
        const text = interaction.options.getString("message") as string
        await interaction.channel?.send(text)
        interaction.reply({ content: success(t("say_success")), ephemeral: true })
    }
}