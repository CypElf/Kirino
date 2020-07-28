module.exports = {
	name: "rolerewards",
    description: "description_rolerewards",
    guildOnly: true,
    args: true,
    category: "xp",
    aliases: ["rr"],

    async execute (bot, msg, args) {
        const arg = args[0]
        if (!arg) return msg.channel.send("Il manque des arguments. Faites `;help xp` pour voir comment utiliser ce mode.")
        const getRole = require("../res/get_role")

        const roleRequest = bot.db.prepare("SELECT * FROM xp_roles WHERE guild_id = ? ORDER BY level ASC")

        const removeDeletedRoles = require("../res/remove_deleted_roles")
        removeDeletedRoles(bot.db, msg.guild)

        if (arg === "list") {
            rolesRows = roleRequest.all(msg.guild.id)
            if (rolesRows.length === 0) return msg.channel.send("Aucun rôle pour le moment.")

            const colorRequest = bot.db.prepare("SELECT color FROM xp WHERE guild_id = ? AND user_id = ?")
            let color = colorRequest.get(msg.guild.id, msg.author.id)

            if (color && color.color) color = color.color
            else color = "#1FE7F0"

            const Discord = require("discord.js")
            const rolesEmbed = new Discord.MessageEmbed()
                .setTitle("**Rôles disponibles**")
                .setThumbnail(msg.guild.iconURL({ dynamic: true }))
                .setColor(color)
                .setFooter(__("request_from") + msg.author.username, msg.author.displayAvatarURL())

            for (const level of [...new Set(rolesRows.map(row => row.level))]) {
                const rolesNames = rolesRows.map(row => {
                    if (row.level == level) return msg.guild.roles.cache.array().find(currentRole => currentRole.id === row.role_id).name
                    else return undefined
                }).filter(role => role !== undefined)
                rolesEmbed.addField(`Niveau ${level}`, "`" + rolesNames.join("`, `") + "`")
            }

            msg.channel.send(rolesEmbed)
        }
        else if (arg === "remove") {
            const roleArg = args[1]
            if (!roleArg) return msg.channel.send("Veuillez préciser un rôle à retirer.")
            
            const role = getRole(msg, args.slice(1))
            if (!role) return msg.channel.send(`${__("bad_role")} ${__("kirino_pout")}`)

            const spRoleRequest = bot.db.prepare("SELECT * FROM xp_roles WHERE guild_id = ? AND role_id = ?")
            const roleRow = spRoleRequest.get(msg.guild.id, role.id)

            if (!roleRow) return msg.channel.send("Le rôle n'est déjà pas présent.")

            const deletionRoleRequest = bot.db.prepare("DELETE FROM xp_roles WHERE guild_id = ? AND role_id = ?")
            deletionRoleRequest.run(msg.guild.id, role.id)

            msg.channel.send("Le rôle a été supprimé avec succès.")
        }
        else {
            const level = args.pop()
            let role = getRole(msg, args)
            if (!role) return msg.channel.send(`${__("bad_role")} ${__("kirino_pout")}`)
            if (role.managed) return msg.channel.send("Ce rôle ne peut être ajouté car il est géré par un service externe.")
            if (isNaN(parseInt(level)) || level <= 0 || level > 100) return msg.channel.send("Niveau invalide, veuillez en préciser un entre 1 et 100.")

            const rolesRows = roleRequest.all(msg.guild.id)

            if (rolesRows.length === 10) return msg.channel.send("Vous avez déjà le maximum de roles ajoutés : 10. Veuillez faire un choix et en supprimer, si vous voulez en ajouter d'autres.")

            if (rolesRows.map(row => row.role_id).filter(role_id => role_id === role.id).length > 0) return msg.channel.send("Role déjà présent. Si votre but est de modifier le niveau qui lui est associé, veuillez le supprimer puis le re ajouter.")

            const addRoleRequest = bot.db.prepare("INSERT INTO xp_roles VALUES(?,?,?)")
            addRoleRequest.run(msg.guild.id, role.id, level)

            msg.channel.send("Le role a bien été ajouté.")
        }
    }
}