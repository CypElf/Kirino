import { SlashCommandBuilder, roleMention, ChatInputCommandInteraction, EmbedBuilder, PermissionFlagsBits } from "discord.js"
import removeDeletedRolesRewards from "../../lib/rolerewards/remove_deleted_roles_rewards"
import { KirinoCommand, Kirino } from "../../lib/misc/types"
import { denied, error, success } from "../../lib/misc/format"
import { XpGuild, XpProfile, XpRole } from "../../lib/misc/database"
import { HexColorString } from "discord.js"
import { GuildMember } from "discord.js"
import { Role } from "discord.js"
import { t } from "../../lib/misc/i18n"

export const command: KirinoCommand = {
    builder: new SlashCommandBuilder()
        .setName("rolerewards")
        .setDescription("Manage the role rewards of the XP system")
        .addSubcommand(option => option.setName("add").setDescription("Add a role to the role rewards").addRoleOption(option => option.setName("role").setDescription("The role to add to the role rewards").setRequired(true)).addIntegerOption(option => option.setName("level").setDescription("The level you want to assign the role as a reward").setRequired(true)))
        .addSubcommand(option => option.setName("remove").setDescription("Remove a role from the role rewards").addRoleOption(option => option.setName("role").setDescription("The role to remove from the role rewards").setRequired(true)))
        .addSubcommand(option => option.setName("list").setDescription("List the currently available role rewards"))
        .setDMPermission(false),

    async execute(bot: Kirino, interaction: ChatInputCommandInteraction) {
        if (!interaction.guild) return
        const member = interaction.member as GuildMember | null

        const isEnabled = (bot.db.prepare("SELECT is_enabled FROM xp_guilds WHERE guild_id = ?").get(interaction.guild?.id) as XpGuild | null)?.is_enabled
        if (!isEnabled) return interaction.reply({ content: error(t("xp_disabled")), ephemeral: true })

        const subcommand = interaction.options.getSubcommand()
        const roleRequest = bot.db.prepare("SELECT * FROM xp_roles WHERE guild_id = ? ORDER BY level ASC")

        await removeDeletedRolesRewards(bot.db, interaction.guild)

        if (subcommand === "list") {
            const rolesRows = roleRequest.all(interaction.guild.id) as XpRole[]
            if (rolesRows.length === 0) return interaction.reply({ content: t("no_role_reward_for_now") })

            const colorRequest = bot.db.prepare("SELECT color FROM xp_profiles WHERE guild_id = ? AND user_id = ?")
            const colorRow = colorRequest.get(interaction.guild.id, interaction.user.id) as XpProfile | null
            const color = colorRow?.color ? colorRow.color as HexColorString : "#1FE7F0"

            const rolesEmbed = new EmbedBuilder()
                .setTitle(`**${t("roles_available")}**`)
                .setThumbnail(interaction.guild.iconURL() ?? "")
                .setColor(color)
                .setFooter({ text: t("request_from") + interaction.user.username, iconURL: interaction.user.displayAvatarURL() })

            for (const level of [...new Set(rolesRows.map(row => row.level))]) {
                const rolesNames = []

                for (const row of rolesRows) {
                    const roles = await interaction.guild?.roles.fetch()

                    const id = [...roles.values()].find(currentRole => currentRole.id === row.role_id)?.id
                    if (row.level === level && id) {
                        rolesNames.push(roleMention(id))
                    }
                }

                rolesEmbed.addFields({ name: `${t("level")} ${level}`, value: rolesNames.join(", ") })
            }

            interaction.reply({ embeds: [rolesEmbed] })
        }
        else if (subcommand === "remove") {
            if (member && !member.permissions.has(PermissionFlagsBits.ManageRoles)) return interaction.reply({ content: denied(t("missing_permissions_to_remove_role")), ephemeral: true })

            const role = interaction.options.getRole("role") as Role

            const roleRow = bot.db.prepare("SELECT * FROM xp_roles WHERE guild_id = ? AND role_id = ?").get(interaction.guild.id, role.id)
            if (!roleRow) return interaction.reply({ content: error(t("role_not_in_database")), ephemeral: true })

            bot.db.prepare("DELETE FROM xp_roles WHERE guild_id = ? AND role_id = ?").run(interaction.guild.id, role.id)

            interaction.reply(success(`${t("role_removed_from_database")}`))
        }
        else if (subcommand === "add") {
            if (member && !member.permissions.has(PermissionFlagsBits.ManageRoles)) return interaction.reply({ content: denied(t("missing_permissions_to_add_role")), ephemeral: true })

            const role = interaction.options.getRole("role") as Role
            const level = interaction.options.getInteger("level") as number

            if (role.managed) return interaction.reply({ content: error(t("role_externally_managed")), ephemeral: true })
            if (level <= 0 || level > 100) return interaction.reply({ content: error(t("bad_level")), ephemeral: true })

            const rolesRows = roleRequest.all(interaction.guild.id) as XpRole[]

            if (rolesRows.map(row => row.role_id).filter(role_id => role_id === role.id).length > 0) return interaction.reply({ content: error(t("rrole_already_present")), ephemeral: true })

            if (rolesRows.length === 10) return interaction.reply({ content: error(t("max_rroles_count_reached")), ephemeral: true })

            bot.db.prepare("INSERT INTO xp_roles VALUES(?,?,?)").run(interaction.guild.id, role.id, level)

            interaction.reply(success(`${t("the_role")} ${role.name} ${t("has_successfully_been_added_to_list")}`))
        }
    }
}