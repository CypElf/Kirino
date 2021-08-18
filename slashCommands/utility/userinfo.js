const { MessageEmbed } = require("discord.js")
const { SlashCommandBuilder, time, roleMention } = require("@discordjs/builders")
const ColorThief = require("colorthief")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("userinfo")
        .setDescription(__("description_userinfo"))
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
        const roles = arrayRoles.join(", ") + " (" + nbRoles + " " + __("roles").toLowerCase() + ")"

        let nickname = member.nickname
        if (nickname === undefined || nickname === null) {
            nickname = __("nothing")
        }

        let premiumSince = member.premiumSince
        if (premiumSince) {
            const premiumSinceMonth = String(premiumSince.getMonth() + 1).padStart(2, "0")
            const premiumSinceDay = String(premiumSince.getDate()).padStart(2, "0")
            const premiumSinceYear = premiumSince.getFullYear()
            const premiumSinceHour = String(premiumSince.getHours()).padStart(2, "0")
            const premiumSinceMinutes = String(premiumSince.getMinutes()).padStart(2, "0")
            const premiumSinceSeconds = String(premiumSince.getSeconds()).padStart(2, "0")
            premiumSince = __("yes_since") + ` ${premiumSinceDay}/${premiumSinceMonth}/${premiumSinceYear} ${__("at")} ${premiumSinceHour}:${premiumSinceMinutes}:${premiumSinceSeconds}`
        }
        else {
            premiumSince = __("no_capitalized")
        }

        const color = await ColorThief.getColor(member.user.displayAvatarURL({ format: "png" }))

        const informations = new MessageEmbed()
            .setAuthor(member.user.tag, member.user.displayAvatarURL())
            .setColor(color)
            .addField(__("id"), member.id, true)
            .addField(__("nickname"), nickname, true)
            .addField(__("join_date"), `${time(member.joinedAt)} (${time(member.joinedAt, "R")})`)
            .addField(__("user_creation_date"), `${time(member.user.createdAt)} (${time(member.user.createdAt, "R")})`)
            .addField(__("booster"), premiumSince, true)
            .addField(__("roles"), roles, true)
            .addField(__("permissions"), perms)
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .setFooter(__("request_from") + interaction.user.username, interaction.user.displayAvatarURL())
        
        interaction.reply({ embeds: [informations] })
    }
}