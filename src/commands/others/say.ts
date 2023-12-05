import { SlashCommandBuilder } from "@discordjs/builders"
import { ChatInputCommandInteraction, GuildMember, PermissionFlagsBits } from "discord.js"
import i18next from "i18next"
import { KirinoCommand, Kirino } from "../../lib/misc/types"
import { denied, success } from "../../lib/misc/format"

const t = i18next.t.bind(i18next)

export const command: KirinoCommand = {
    builder: new SlashCommandBuilder()
        .setName("say")
        .setDescription("Make me say something")
        .addStringOption(option => option.setName("message").setDescription("The text content you want me to send as a message").setRequired(true)),
    guildOnly: true,
    permissions: ["administrator"],

    async execute(bot: Kirino, interaction: ChatInputCommandInteraction) {
        const text = interaction.options.getString("message") as string

        const member = interaction.member as GuildMember | null
        if (interaction.user.id !== process.env.OWNER_ID && member && !member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({ content: denied(t("not_allowed_to_use_this_command")), ephemeral: true })
        }

        await interaction.channel?.send(text)
        interaction.reply({ content: success(t("say_success")), ephemeral: true })
    }
}