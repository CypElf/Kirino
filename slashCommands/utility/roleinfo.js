const { SlashCommandBuilder, time } = require("@discordjs/builders")
const { MessageEmbed } = require("discord.js")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("roleinfo")
        .setDescription(__("description_roleinfo"))
        .addRoleOption(option => option.setName("role").setDescription("The role you want informations about").setRequired(true)),
    guildOnly: true,
    cooldown: 3,

    async execute(bot, interaction) {
        const role = interaction.options.getRole("role")

        const perms = "`" + role.permissions.toArray().map(flag => flag.toLowerCase().replaceAll("_", " ")).join("`, `") + "`"

        const informations = new MessageEmbed()
            .setAuthor(__("roles", 1) + " : " + role.name)
            .setColor(role.hexColor)
            .addField(__("id"), role.id, true)
            .addField(__("color"), role.hexColor.toUpperCase(), true)
            .addField(__("mentionnable"), role.mentionable ? __("yes") : __("no"), true)
            .addField(__("separated_category"), role.hoist ? __("yes") : __("no"), true)
            .addField(__("position"), role.position.toString(), true)
            .addField(__("external_handler"), role.managed ? __("yes") : __("no"), true)
            .addField(__("role_creation_date"), `${time(role.createdAt)} (${time(role.createdAt, "R")})`)
            .addField(__("permissions"), perms !== "``" ? perms : "`" + __("no_permissions") + "`")
            .setFooter(__("request_from") + interaction.user.username, interaction.user.displayAvatarURL())

        interaction.reply({ embeds: [informations] })
    }
}