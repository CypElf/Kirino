import { SlashCommandBuilder, ChatInputCommandInteraction, GuildMember, PermissionFlagsBits, User } from "discord.js"
import i18next from "i18next"
import { Kirino } from "../../lib/misc/types"
import { what, denied, error } from "../../lib/misc/format"

const t = i18next.t.bind(i18next)

export const command = {
    data: new SlashCommandBuilder()
        .setName("ban")
        .setDescription("Ban the specified user")
        .addUserOption(option => option.setName("user").setDescription("The user to ban").setRequired(true))
        .addStringOption(option => option.setName("reason").setDescription("The reason why the user will be banned")),
    guildOnly: true,
    cooldown: 3,
    permissions: ["ban members"],

    async execute(bot: Kirino, interaction: ChatInputCommandInteraction ) {
        const bannerMember = interaction.member as GuildMember | null

        if (!bannerMember?.permissions.has(PermissionFlagsBits.BanMembers)) {
            return interaction.reply({ content: denied(t("you_are_missing_permissions_to_ban_members")), ephemeral: true })
        }

        if (!interaction.guild?.members.me?.permissions.has(PermissionFlagsBits.BanMembers)) {
            return interaction.reply({ content: error(t("i_am_missing_permissions_to_ban_members")), ephemeral: true })
        }

        const user = interaction.options.getUser("user") as User
        const reason = interaction.options.getString("reason") ?? t("no_ban_reason")

        let targetMember

        try {
            targetMember = await interaction.guild.members.fetch(user.id)

            if (!targetMember.bannable) {
                return interaction.reply({ content: error(t("unable_to_ban_higher_than_me")), ephemeral: true })
            }

            if (targetMember.id === bannerMember.id) {
                return interaction.reply({ content: denied(t("cannot_ban_yourself")), ephemeral: true })
            }

            if (bannerMember.roles.highest.comparePositionTo(targetMember.roles.highest) < 0) {
                return interaction.reply({ content: denied(t("you_cannot_ban_this_member")), ephemeral: true })
            }
        }
        catch {
            return interaction.reply({ content: what(t("user_not_found")), ephemeral: true })
        }

        interaction.guild.members.ban(user, { reason: `${reason} (${t("banned_by")} ${interaction.user.tag})` })
        interaction.reply(`${user.username + t("has_been_banned")} <:hammer:568068459485855752>`)
    }
}