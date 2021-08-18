const { time } = require("@discordjs/builders")

module.exports = {
    name: "roleinfo",
    guildOnly: true,
    args: true,
    aliases: ["ri"],
    cooldown: 3,

    async execute(bot, msg, args) {
        const { MessageEmbed } = require("discord.js")
        const getRole = require("../../lib/getters/get_role")
        const role = await getRole(msg, args)
        if (!role) return msg.channel.send(`${__("bad_role")} ${__("kirino_pout")}`)

        const perms = "`" + role.permissions.toArray().map(flag => flag.toLowerCase().replaceAll("_", " ")).join("`, `") + "`"

        const informations = new MessageEmbed()
            .setAuthor(__n("roles", 1) + " : " + role.name)
            .setColor(role.hexColor)
            .addField(__("id"), role.id, true)
            .addField(__("color"), role.hexColor.toUpperCase(), true)
            .addField(__("mentionnable"), role.mentionable ? __("yes") : __("no"), true)
            .addField(__("separated_category"), role.hoist ? __("yes") : __("no"), true)
            .addField(__("position"), role.position.toString(), true)
            .addField(__("external_handler"), role.managed ? __("yes") : __("no"), true)
            .addField(__("role_creation_date"), `${time(role.createdAt)} (${time(role.createdAt, "R")})`)
            .addField(__("permissions"), perms !== "``" ? perms : "`" + __("no_permissions") + "`")
            .setFooter(__("request_from") + msg.author.username, msg.author.displayAvatarURL())

        msg.channel.send({ embeds: [informations] })
    }
}