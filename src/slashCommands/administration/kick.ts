import { SlashCommandBuilder } from "@discordjs/builders"
import { CommandInteraction, GuildMember, User, Permissions } from "discord.js"
import i18next from "i18next"
import { Kirino } from "../../lib/misc/types"

const t = i18next.t.bind(i18next)

export default {
    data: new SlashCommandBuilder()
        .setName("kick")
        .setDescription("Kick the specified user")
        .addUserOption(option => option.setName("user").setDescription("The user to kick").setRequired(true))
        .addStringOption(option => option.setName("reason").setDescription("The reason why the user will be kick")),
    guildOnly: true,
    cooldown: 3,
    permissions: ["kick members"],

    async execute(bot: Kirino, interaction: CommandInteraction) {
        const kickerMember = interaction.member as GuildMember | null

        if (kickerMember && !kickerMember.permissions.has(Permissions.FLAGS.KICK_MEMBERS)) {
            return interaction.reply({ content: `${t("you_are_missing_permissions_to_kick_members")} ${t("common:kirino_pff")}`, ephemeral: true })
        }

        if (interaction.guild && interaction.guild.me && !interaction.guild.me.permissions.has(Permissions.FLAGS.KICK_MEMBERS)) {
            return interaction.reply({ content: `${t("i_am_missing_permissions_to_kick_members")} ${t("common:kirino_pout")}`, ephemeral: true })
        }

        const user = interaction.options.getUser("user") as User
        const reason = interaction.options.getString("reason") ?? t("no_kick_reason")

        try {
            const kickedMember = await interaction.guild?.members.fetch(user.id)

            if (kickedMember && !kickedMember.kickable) {
                return interaction.reply({ content: `${t("unable_to_kick_higher_than_me")} ${t("common:kirino_pout")}`, ephemeral: true })
            }

            if (kickedMember && kickedMember.id === kickerMember?.id) {
                return interaction.reply({ content: `${t("cannot_kick_yourself")} ${t("common:kirino_pff")}`, ephemeral: true })
            }

            if (kickerMember && kickedMember && kickerMember.roles.highest.comparePositionTo(kickedMember.roles.highest) < 0) {
                return interaction.reply({ content: `${t("you_cannot_kick_this_member")} ${t("common:kirino_pff")}`, ephemeral: true })
            }

            await kickedMember?.kick(`${reason} (${t("kicked_by")} ${interaction.user.tag})`)

            interaction.reply(`${user.username + t("has_been_kicked")} <:boot:568041855523094549>`)
        }
        catch {
            interaction.reply({ content: `${t("user_not_on_server")} ${t("common:kirino_pout")}`, ephemeral: true })
        }
    }
}