module.exports = {
	name: "rolerewards",
    guildOnly: true,
    args: true,
    aliases: ["rr"],
    permissions: ["{administrator}"],

    async execute (bot, msg, args) {
        const xpActivationRequest = bot.db.prepare("SELECT is_enabled FROM xp_guilds WHERE guild_id = ?")
        let isEnabled = xpActivationRequest.get(msg.guild.id)
        if (isEnabled) isEnabled = isEnabled.is_enabled

        if (!isEnabled) return msg.channel.send(`${__("currently_disabled_enable_with")} \`${bot.prefix}xp enable\`.`)

        const arg = args[0]
        const getRole = require("../../lib/getters/get_role")

        const roleRequest = bot.db.prepare("SELECT * FROM xp_roles WHERE guild_id = ? ORDER BY level ASC")

        const removeDeletedRolesRewards = require("../../lib/rolerewards/remove_deleted_roles_rewards")
        await removeDeletedRolesRewards(bot.db, msg.guild)

        if (arg === "list") {
            rolesRows = roleRequest.all(msg.guild.id)
            if (rolesRows.length === 0) return msg.channel.send(__("no_role_reward_for_now"))

            const colorRequest = bot.db.prepare("SELECT color FROM xp_profiles WHERE guild_id = ? AND user_id = ?")
            let color = colorRequest.get(msg.guild.id, msg.author.id)

            if (color && color.color) color = color.color
            else color = "#1FE7F0"

            const Discord = require("discord.js")
            const rolesEmbed = new Discord.MessageEmbed()
                .setTitle(`**${__("roles_available")}**`)
                .setThumbnail(msg.guild.iconURL({ dynamic: true }))
                .setColor(color)
                .setFooter(__("request_from") + msg.author.username, msg.author.displayAvatarURL())

            for (const level of [...new Set(rolesRows.map(row => row.level))]) {
                const rolesNames = rolesRows.map(row => {
                    if (row.level == level) return msg.guild.roles.cache.array().find(currentRole => currentRole.id === row.role_id).name
                    else return undefined
                }).filter(role => role !== undefined)
                rolesEmbed.addField(`${__("level")} ${level}`, "`" + rolesNames.join("`, `") + "`")
            }

            msg.channel.send(rolesEmbed)
        }
        else if (arg === "remove") {
            if (!msg.member.hasPermission("ADMINISTRATOR")) return msg.channel.send(__("missing_permissions_to_remove_role"))
            const roleArg = args[1]
            if (!roleArg) return msg.channel.send(__("precise_role_to_remove"))
            
            const role = await getRole(msg, args.slice(1))
            if (!role) return msg.channel.send(`${__("bad_role")} ${__("kirino_pout")}`)

            const spRoleRequest = bot.db.prepare("SELECT * FROM xp_roles WHERE guild_id = ? AND role_id = ?")
            const roleRow = spRoleRequest.get(msg.guild.id, role.id)

            if (!roleRow) return msg.channel.send(__("role_not_in_database"))

            const deletionRoleRequest = bot.db.prepare("DELETE FROM xp_roles WHERE guild_id = ? AND role_id = ?")
            deletionRoleRequest.run(msg.guild.id, role.id)

            msg.channel.send(__("role_removed_from_database"))
        }
        else {
            if (!msg.member.hasPermission("ADMINISTRATOR")) return msg.channel.send(__("missing_permissions_to_add_role"))
            const level = parseInt(args.pop())
            let role = await getRole(msg, args)
            if (!role) return msg.channel.send(`${__("bad_role")} ${__("kirino_pout")}`)
            if (role.managed) return msg.channel.send(__("role_externally_managed"))
            if (isNaN(level) || level <= 0 || level > 100) return msg.channel.send(__("bad_level"))

            const rolesRows = roleRequest.all(msg.guild.id)

            if (rolesRows.map(row => row.role_id).filter(role_id => role_id === role.id).length > 0) return msg.channel.send(__("rrole_already_present"))

            if (rolesRows.length === 10) return msg.channel.send(__("max_rroles_count_reached"))

            const addRoleRequest = bot.db.prepare("INSERT INTO xp_roles VALUES(?,?,?)")
            addRoleRequest.run(msg.guild.id, role.id, level)

            msg.channel.send(`${__("the_role")} ${role.name} ${__("has_successfully_been_added_to_list")}`)
        }
    }
}