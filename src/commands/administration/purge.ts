import { SlashCommandBuilder } from "@discordjs/builders"
import { CommandInteraction, GuildMember, TextChannel, Permissions } from "discord.js"
import i18next from "i18next"
import { Kirino } from "../../lib/misc/types"
import { success } from "../../lib/misc/format"

const t = i18next.t.bind(i18next)

export const command = {
    data: new SlashCommandBuilder()
        .setName("purge")
        .setDescription("Delete the specified amount of messages from the last messages in the current channel")
        .addIntegerOption(option => option.setName("amount_of_messages").setDescription("The number of messages you want to delete").setRequired(true)),
    guildOnly: true,
    permissions: ["manage messages"],

    async execute(bot: Kirino, interaction: CommandInteraction) {
        const member = interaction.member as GuildMember | null
        if (member && !member.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES)) {
            return interaction.reply({ content: `${t("you_cannot_delete_messages")} ${t("common:kirino_pff")}`, ephemeral: true })
        }

        const count = interaction.options.getInteger("amount_of_messages") as number

        if (count <= 0) return interaction.reply({ content: `${t("please_insert_positive_integer")} ${t("common:kirino_pout")}`, ephemeral: true })

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