import { SlashCommandBuilder } from "@discordjs/builders"
import { Permissions } from "discord.js"
import i18next from "i18next"

const t = i18next.t.bind(i18next)

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ban")
        .setDescription("Ban the specified user")
        .addUserOption(option => option.setName("user").setDescription("The user to ban").setRequired(true))
        .addStringOption(option => option.setName("reason").setDescription("The reason why the user will be banned")),
    guildOnly: true,
    cooldown: 3,
    permissions: ["ban members"],

    async execute(bot, interaction) {
        if (!interaction.member.permissions.has(Permissions.FLAGS.BAN_MEMBERS)) {
            return interaction.reply({ content: `${t("you_are_missing_permissions_to_ban_members")} ${t("common:kirino_pff")}`, ephemeral: true })
        }

        if (!interaction.guild.me.permissions.has(Permissions.FLAGS.BAN_MEMBERS)) {
            return interaction.reply({ content: `${t("i_am_missing_permissions_to_ban_members")} ${t("common:kirino_pout")}`, ephemeral: true })
        }

        const user = interaction.options.getUser("user")
        const reason = interaction.options.getString("reason") ?? t("no_ban_reason")

        try {
            const member = await interaction.guild.members.fetch(user.id)

            if (!member.bannable) {
                return interaction.reply({ content: `${t("unable_to_ban_higher_than_me")} ${t("common:kirino_pout")}`, ephemeral: true })
            }

            if (member.id === interaction.member.id) {
                return interaction.reply({ content: `${t("cannot_ban_yourself")} ${t("common:kirino_pff")}`, ephemeral: true })
            }

            if (interaction.member.roles.highest.comparePositionTo(member.roles.highest) < 0) {
                return interaction.reply({ content: `${t("you_cannot_ban_this_member")} ${t("common:kirino_pff")}`, ephemeral: true })
            }
        }
        // eslint-disable-next-line no-empty
        catch {}

        interaction.guild.members.ban(user, { reason: `${reason} (${t("banned_by")} ${interaction.user.tag})` })
        interaction.reply(`${user.username + t("has_been_banned")} <:hammer:568068459485855752>`)
    }
}