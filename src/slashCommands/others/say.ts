import { SlashCommandBuilder } from "@discordjs/builders"
import { CommandInteraction, GuildMember, Permissions } from "discord.js"
import i18next from "i18next"
import { Kirino } from "../../lib/misc/types"

const t = i18next.t.bind(i18next)

export default {
    data: new SlashCommandBuilder()
        .setName("say")
        .setDescription("Make me say something")
        .addStringOption(option => option.setName("message").setDescription("The text content you want me to send as a message").setRequired(true)),
    guildOnly: true,
    permissions: ["administrator"],

    async execute(bot: Kirino, interaction: CommandInteraction) {
        const text = interaction.options.getString("message") as string

        const member = interaction.member as GuildMember | null
        if (interaction.user.id !== process.env.OWNER_ID && member && !member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
            return interaction.reply({ content: `${t("not_allowed_to_use_this_command")} ${t("common:kirino_pff")}`, ephemeral: true })
        }

        await interaction.channel?.send(text)
        interaction.reply({ content: `${t("say_success")} ${t("common:kirino_glad")}`, ephemeral: true })
    }
}