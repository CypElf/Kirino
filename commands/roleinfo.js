const Discord = require('discord.js')

module.exports = {
	name: "roleinfo",
    description: "description_roleinfo",
    guildOnly: true,
    args: true,
    usage: "usage_roleinfo",
    aliases: ["ri"],
    cooldown: 3,
    category: "utility",
    
    async execute(bot, msg, args) {

        const getRole = require("../lib/get_role")
        let role = await getRole(msg, args)
        if (!role) return msg.channel.send(`${__("bad_role")} ${__("kirino_pout")}`)

        // ------------------------------------------ //

        let creationDate = role.createdAt
        const creationMonth = String(creationDate.getMonth() + 1).padStart(2, "0")
        const creationDay = String(creationDate.getDate()).padStart(2, "0")
        const creationYear = creationDate.getFullYear()
        const creationHour = String(creationDate.getHours()).padStart(2, "0")
        const creationMinutes = String(creationDate.getMinutes()).padStart(2, "0")
        const cretionsSeconds = String(creationDate.getSeconds()).padStart(2, "0")
        creationDate = `${creationDay}/${creationMonth}/${creationYear} ${__("at")} ${creationHour}:${creationMinutes}:${cretionsSeconds}`
        
        const porteurs = role.members.array().length
        const membresServeur = msg.guild.members.cache.array().length
        const percentage = (porteurs / membresServeur * 100).toPrecision(3)
        let permsArray = role.permissions.toArray()
        let perms = ""
        permsArray.forEach(perm => {
            perms += "`" + perm.toLowerCase().replace(/_/g, " ") + "`, "
        })

        perms = perms.substring(0, perms.length - 2)

        let informations = new Discord.MessageEmbed()
        .setAuthor(__n("roles", 1) + " : " + role.name)
        .setColor(role.hexColor)
        .addField(__("id"), role.id, true)
        .addField(__("color"), role.hexColor.toUpperCase(), true)
        .addField(__("mentionnable"), role.mentionable ? __("yes") : __("no"), true)
        .addField(__("separated_category"), role.hoist ? __("yes") : __("no"), true)
        .addField(__("position"), role.position, true)
        .addField(__("external_handler"), role.managed ? __("yes") : __("no"), true)
        .addField(__("users_with_this_role"), porteurs + " (" + percentage + "%)", true)
        .addField(__("role_creation_date"), creationDate, true)
        .addField(__("permissions"), perms !== "" ? perms : "`" + __("no_permissions") + "`")
        .setFooter(__("request_from") + msg.author.username, msg.author.displayAvatarURL())
        msg.channel.send(informations)
    }
}