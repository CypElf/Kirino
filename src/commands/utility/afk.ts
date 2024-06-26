import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js"
import { KirinoCommand, Kirino } from "../../lib/misc/types"
import { error, success } from "../../lib/misc/format"
import { t } from "../../lib/misc/i18n"

export const command: KirinoCommand = {
    builder: new SlashCommandBuilder()
        .setName("afk")
        .setDescription("Allow you to leave a message for those who mention you while you're AFK")
        .addStringOption(option => option.setName("reason").setDescription("The reason why you're AFK"))
        .setDMPermission(false),

    async execute(bot: Kirino, interaction: ChatInputCommandInteraction) {
        const reason = interaction.options.getString("reason")

        if (reason && reason.length > 1800) {
            return interaction.reply({ content: error(t("afk_reason_too_long")), ephemeral: true })
        }

        bot.db.prepare("INSERT INTO afk(user_id, reason) VALUES(?, ?)").run(interaction.user.id, reason)

        if (reason) {
            return interaction.reply(`${success(t("added_to_afk_with_reason"))} : ${reason}`)
        }
        else {
            return interaction.reply(success(t("added_to_afk_without_reason")))
        }
    }
}