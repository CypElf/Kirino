import { SlashCommandBuilder } from "@discordjs/builders"
import { Channel, CommandInteraction, Guild, GuildMember, Permissions, Role } from "discord.js"
import i18next from "i18next"
import { Kirino } from "../../lib/misc/types"
import { XpBlacklistedChannel, XpBlacklistedRole, XpGuild } from "../../lib/misc/database"
import { Database } from "better-sqlite3"

const t = i18next.t.bind(i18next)

export default {
    data: new SlashCommandBuilder()
        .setName("blacklist")
        .setDescription("Allow you to blacklist a role or channel from the XP system")
        .addSubcommand(option => option.setName("list").setDescription("Display the blacklisted roles and channels"))
        .addSubcommandGroup(option => option.setName("channel").setDescription("Add or remove a channel from the blacklist")
            .addSubcommand(option => option.setName("add").setDescription("Blacklist a channel").addChannelOption(option => option.setName("channel").setDescription("The channel to blacklist").setRequired(true)))
            .addSubcommand(option => option.setName("remove").setDescription("Remove a channel from the blacklist").addChannelOption(option => option.setName("channel").setDescription("The channel to remove from the blacklist").setRequired(true))))
        .addSubcommandGroup(option => option.setName("role").setDescription("Add or remove a role from the blacklist")
            .addSubcommand(option => option.setName("add").setDescription("Blacklist a role").addRoleOption(option => option.setName("role").setDescription("The role to blacklist").setRequired(true)))
            .addSubcommand(option => option.setName("remove").setDescription("Remove a role from the blacklist").addRoleOption(option => option.setName("role").setDescription("The role to remove from the blacklist").setRequired(true)))),
    guildOnly: true,
    permissions: ["{administrator}"],

    async execute(bot: Kirino, interaction: CommandInteraction) {
        if (!interaction.guild) return
        const member = interaction.member as GuildMember | null

        const isEnabled = (bot.db.prepare("SELECT is_enabled FROM xp_guilds WHERE guild_id = ?").get(interaction.guild?.id) as XpGuild | null)?.is_enabled
        if (!isEnabled) return interaction.reply({ content: `${t("currently_disabled_enable_with")} \`${bot.prefix}xp enable\`.`, ephemeral: true })

        const channelRequest = bot.db.prepare("SELECT * FROM xp_blacklisted_channels WHERE guild_id = ?")
        const roleRequest = bot.db.prepare("SELECT * FROM xp_blacklisted_roles WHERE guild_id = ?")

        removeDeletedBlacklistedChannels(bot.db, interaction.guild)

        const channel = interaction.options.getChannel("channel") as Channel
        const role = interaction.options.getRole("role") as Role

        if (interaction.options.getSubcommand() === "remove") {

            if (member && !member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) return interaction.reply({ content: `${t("missing_permissions_to_remove_channel")} ${t("common:kirino_pff")}`, ephemeral: true })

            if (interaction.options.getSubcommandGroup() === "channel") {
                if (channel.type !== "GUILD_TEXT") return interaction.reply({ content: `${t("not_a_text_channel")} ${t("common:kirino_pout")}`, ephemeral: true })

                const spChannelRequest = bot.db.prepare("SELECT * FROM xp_blacklisted_channels WHERE guild_id = ? AND channel_id = ?")
                const channelRow = spChannelRequest.get(interaction.guild.id, channel.id)

                if (!channelRow) return interaction.reply({ content: `${t("channel_not_in_db")} ${t("common:kirino_pout")}`, ephemeral: true })

                bot.db.prepare("DELETE FROM xp_blacklisted_channels WHERE guild_id = ? AND channel_id = ?").run(interaction.guild.id, channel.id)

                interaction.reply(`${t("the_channel")} <#${channel.id}> ${t("has_been_removed_from_channels_list")} ${t("common:kirino_glad")}`)
            }

            else {
                const spRoleRequest = bot.db.prepare("SELECT * FROM xp_blacklisted_roles WHERE guild_id = ? AND role_id = ?")
                const roleRow = spRoleRequest.get(interaction.guild.id, role.id)

                if (!roleRow) return interaction.reply({ content: `${t("role_not_in_db")} ${t("common:kirino_pout")}`, ephemeral: true })

                bot.db.prepare("DELETE FROM xp_blacklisted_roles WHERE guild_id = ? AND role_id = ?").run(interaction.guild.id, role.id)

                interaction.reply(`${t("the_role")} ${role.name} ${t("has_been_removed_from_roles_list")} ${t("common:kirino_glad")}`)
            }
        }
        else if (interaction.options.getSubcommand() === "list") {
            const channelsRows = (channelRequest.all(interaction.guild.id) as XpBlacklistedChannel[]).map(row => row.channel_id)
            const rolesRows = (roleRequest.all(interaction.guild.id) as XpBlacklistedRole[]).map(row => row.role_id)
            const blacklistedChannels = [...interaction.guild.channels.cache.values()].filter(ch => channelsRows.includes(ch.id)).map(ch => ch.id)
            const blacklistedRoles = [...interaction.guild.roles.cache.values()].filter(r => rolesRows.includes(r.id)).map(r => r.id)

            const blacklistEmbed = new MessageEmbed()
                .setTitle(t("blacklist"))
                .setColor("#000000")

            if (blacklistedChannels.length === 0 && blacklistedRoles.length === 0) blacklistEmbed.setDescription(t("no_blacklisted_channels_or_roles"))
            else {
                if (blacklistedChannels.length > 0) blacklistEmbed.addField(t("blacklisted_channels"), `<#${blacklistedChannels.join(">, <#")}>`)
                if (blacklistedRoles.length > 0) blacklistEmbed.addField(t("blacklisted_roles"), `<@&${blacklistedRoles.join(">, <@&")}>`)
            }

            interaction.reply({ embeds: [blacklistEmbed] })
        }
        else {
            if (member && !member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) return interaction.reply({ content: t("missing_perm_to_add_channel"), ephemeral: true })

            if (interaction.options.getSubcommandGroup() === "channel") {
                if (channel.type !== "GUILD_TEXT") return interaction.reply({ content: `${t("not_a_text_channel")} ${t("common:kirino_pout")}`, ephemeral: true })

                const channelsRows = channelRequest.all(interaction.guild.id) as XpBlacklistedChannel[]

                if (channelsRows.map(row => row.channel_id).filter(channel_id => channel_id === channel.id).length > 0) return interaction.reply({ content: t("channel_already_present"), ephemeral: true })

                if (channelsRows.length >= 10) return interaction.reply({ content: `${t("max_channels_count_reached")} ${t("common:kirino_pout")}`, ephemeral: true })

                const addChannelRequest = bot.db.prepare("INSERT INTO xp_blacklisted_channels VALUES(?,?)")
                addChannelRequest.run(interaction.guild.id, channel.id)

                return interaction.reply(`${t("the_channel")} <#${channel.id}> ${t("has_been_added_to_channels_list")} ${t("common:kirino_glad")}`)
            }

            else {
                const rolesRows = roleRequest.all(interaction.guild.id) as XpBlacklistedRole[]

                if (rolesRows.map(row => row.role_id).filter(role_id => role_id === role.id).length > 0) return interaction.reply({ content: t("bl_role_already_present"), ephemeral: true })

                if (rolesRows.length >= 10) return interaction.reply({ content: `${t("max_bl_roles_count_reached")} ${t("common:kirino_pout")}`, ephemeral: true })

                const addChannelRequest = bot.db.prepare("INSERT INTO xp_blacklisted_roles VALUES(?,?)")
                addChannelRequest.run(interaction.guild.id, role.id)

                return interaction.reply(`${t("the_role")} ${role.name} ${t("has_been_added_to_roles_list")} ${t("common:kirino_glad")}`)
            }
        }
    }
}

function removeDeletedBlacklistedChannels(db: Database, guild: Guild) {
    const channelsRequest = db.prepare("SELECT * FROM xp_blacklisted_channels WHERE guild_id = ?")
    const channelsRows = channelsRequest.all(guild.id) as XpBlacklistedChannel[]

    const deletionChannelRequest = db.prepare("DELETE FROM xp_blacklisted_channels WHERE guild_id = ? AND channel_id = ?")

    for (const row of channelsRows) {
        if ([...guild.channels.cache.values()].find(currentChannel => currentChannel.id === row.channel_id) === undefined) {
            deletionChannelRequest.run(guild.id, row.channel_id)
        }
    }
}