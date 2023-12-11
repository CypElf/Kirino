import { SlashCommandBuilder, ChatInputCommandInteraction, GuildMember, User, PermissionFlagsBits } from "discord.js"
import { KirinoCommand, Kirino } from "../../lib/misc/types"
import { denied, error } from "../../lib/misc/format"
import { t } from "../../lib/misc/i18n"

export const command: KirinoCommand = {
    builder: new SlashCommandBuilder()
        .setName("kick")
        .setDescription("Kick the specified user")
        .addUserOption(option => option.setName("user").setDescription("The user to kick").setRequired(true))
        .addStringOption(option => option.setName("reason").setDescription("The reason why the user will be kick"))
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
        .setDMPermission(false),

    async execute(bot: Kirino, interaction: ChatInputCommandInteraction) {
        const kickerMember = interaction.member as GuildMember | null

        if (interaction.guild && interaction.guild.members.me && !interaction.guild.members.me.permissions.has(PermissionFlagsBits.KickMembers)) {
            return interaction.reply({ content: error(t("i_am_missing_permissions_to_kick_members")), ephemeral: true })
        }

        const user = interaction.options.getUser("user") as User
        const reason = interaction.options.getString("reason") ?? t("no_kick_reason")

        try {
            const kickedMember = await interaction.guild?.members.fetch(user.id)

            if (kickedMember && !kickedMember.kickable) {
                return interaction.reply({ content: error(t("unable_to_kick_higher_than_me")), ephemeral: true })
            }

            if (kickedMember && kickedMember.id === kickerMember?.id) {
                return interaction.reply({ content: denied(t("cannot_kick_yourself")), ephemeral: true })
            }

            if (kickerMember && kickedMember && kickerMember.roles.highest.comparePositionTo(kickedMember.roles.highest) < 0) {
                return interaction.reply({ content: denied(t("you_cannot_kick_this_member")), ephemeral: true })
            }

            await kickedMember?.kick(`${reason} (${t("kicked_by")} ${interaction.user.tag})`)

            interaction.reply(`${user.username + t("has_been_kicked")} <:boot:568041855523094549>`)
        }
        catch {
            interaction.reply({ content: error(t("user_not_on_server")), ephemeral: true })
        }
    }
}