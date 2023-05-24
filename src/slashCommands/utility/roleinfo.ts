const { SlashCommandBuilder, time } = require("@discordjs/builders")
const { MessageEmbed } = require("discord.js")
const t = require("i18next").t.bind(require("i18next"))

module.exports = {
    data: new SlashCommandBuilder()
        .setName("roleinfo")
        .setDescription("Give you informations about a role")
        .addRoleOption(option => option.setName("role").setDescription("The role you want informations about").setRequired(true)),
    guildOnly: true,
    cooldown: 3,

    async execute(bot, interaction) {
        const role = interaction.options.getRole("role")

        const perms = "`" + role.permissions.toArray().map(flag => flag.toLowerCase().replaceAll("_", " ")).join("`, `") + "`"

        const informations = new MessageEmbed()
            .setAuthor({ name: t("roles", 1) + " : " + role.name })
            .setColor(role.hexColor)
            .addField(t("id"), role.id, true)
            .addField(t("color"), role.hexColor.toUpperCase(), true)
            .addField(t("mentionnable"), role.mentionable ? t("yes") : t("no"), true)
            .addField(t("separated_category"), role.hoist ? t("yes") : t("no"), true)
            .addField(t("position"), role.position.toString(), true)
            .addField(t("external_handler"), role.managed ? t("yes") : t("no"), true)
            .addField(t("role_creation_date"), `${time(role.createdAt)} (${time(role.createdAt, "R")})`)
            .addField(t("permissions"), perms !== "``" ? perms : "`" + t("no_permissions") + "`")
            .setFooter({ text: t("common:request_from", { username: interaction.user.username }), iconURL: interaction.user.displayAvatarURL() })

        interaction.reply({ embeds: [informations] })
    }
}