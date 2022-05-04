const { SlashCommandBuilder, time, roleMention } = require("@discordjs/builders")
const { MessageEmbed } = require("discord.js")
const t = require("i18next").t.bind(require("i18next"))
const ColorThief = require("colorthief")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("userinfo")
        .setDescription("Give you informations about a user")
        .addUserOption(option => option.setName("user").setDescription("The user you want informations about")),
    guildOnly: true,
    cooldown: 3,

    async execute(bot, interaction) {
        const user = interaction.options.getUser("user") ?? interaction.user
        const member = await interaction.guild.members.fetch(user.id)

        const perms = "`" + member.permissions.toArray().map(flag => flag.toLowerCase().replaceAll("_", " ")).join("`, `") + "`"

        const arrayTotalRoles = member.roles.cache
        const arrayRoles = []
        let nbRoles = 0
        arrayTotalRoles.forEach((role) => {
            if (role.name !== "@everyone") {
                arrayRoles.push(roleMention(role.id))
                nbRoles++
            }
        })
        const roles = arrayRoles.join(", ") + " (" + nbRoles + " " + t("role", { count: nbRoles }).toLowerCase() + ")"

        let nickname = member.nickname
        if (nickname === undefined || nickname === null) {
            nickname = t("nothing")
        }

        let premiumSince = member.premiumSince
        if (premiumSince) {
            const premiumSinceMonth = String(premiumSince.getMonth() + 1).padStart(2, "0")
            const premiumSinceDay = String(premiumSince.getDate()).padStart(2, "0")
            const premiumSinceYear = premiumSince.getFullYear()
            const premiumSinceHour = String(premiumSince.getHours()).padStart(2, "0")
            const premiumSinceMinutes = String(premiumSince.getMinutes()).padStart(2, "0")
            const premiumSinceSeconds = String(premiumSince.getSeconds()).padStart(2, "0")
            premiumSince = t("yes_since") + ` ${premiumSinceDay}/${premiumSinceMonth}/${premiumSinceYear} ${t("at")} ${premiumSinceHour}:${premiumSinceMinutes}:${premiumSinceSeconds}`
        }
        else {
            premiumSince = t("no_capitalized")
        }

        const color = await ColorThief.getColor(member.user.displayAvatarURL({ format: "png" }))

        const informations = new MessageEmbed()
            .setAuthor({ name: member.user.tag, iconURL: member.user.displayAvatarURL() })
            .setColor(color)
            .addField(t("id"), member.id, true)
            .addField(t("nickname"), nickname, true)
            .addField(t("join_date"), `${time(member.joinedAt)} (${time(member.joinedAt, "R")})`)
            .addField(t("user_creation_date"), `${time(member.user.createdAt)} (${time(member.user.createdAt, "R")})`)
            .addField(t("booster"), premiumSince, true)
            .addField(t("role", { count: nbRoles }), roles, true)
            .addField(t("permissions"), perms)
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .setFooter({ text: t("common:request_from", { username: interaction.user.username }), iconURL: interaction.user.displayAvatarURL() })

        interaction.reply({ embeds: [informations] })
    }
}