import { SlashCommandBuilder } from "@discordjs/builders"
import { CommandInteraction } from "discord.js"
import i18next from "i18next"
import { Kirino } from "../../lib/misc/types"

const t = i18next.t.bind(i18next)

export default {
    data: new SlashCommandBuilder()
        .setName("afk")
        .setDescription("Allow you to leave a message for those who mention you while you're AFK")
        .addStringOption(option => option.setName("reason").setDescription("The reason why you're AFK")),
    guildOnly: true,

    async execute(bot: Kirino, interaction: CommandInteraction) {
        const reason = interaction.options.getString("reason")

        if (reason && reason.length > 1800) {
            return interaction.reply({ content: `${t("afk_reason_too_long")} ${t("common:kirino_pout")}`, ephemeral: true })
        }

        bot.db.prepare("INSERT INTO afk(user_id, reason) VALUES(?, ?)").run(interaction.user.id, reason)

        if (reason) {
            return interaction.reply(`${t("added_to_afk_with_reason")} ${t("common:kirino_glad")} : ${reason}`)
        }
        else {
            return interaction.reply(`${t("added_to_afk_without_reason")} ${t("common:kirino_glad")}`)
        }
    }
}