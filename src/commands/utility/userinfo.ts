import { SlashCommandBuilder, time, roleMention } from "@discordjs/builders"
import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js"
import i18next from "i18next"
// @ts-ignore
import ColorThief from "colorthief"
import { KirinoCommand, Kirino } from "../../lib/misc/types"

const t = i18next.t.bind(i18next)

export const command: KirinoCommand = {
    builder: new SlashCommandBuilder()
        .setName("userinfo")
        .setDescription("Give you informations about a user")
        .addUserOption(option => option.setName("user").setDescription("The user you want informations about")),
    guildOnly: true,

    async execute(bot: Kirino, interaction: ChatInputCommandInteraction) {
        const user = interaction.options.getUser("user") ?? interaction.user
        const member = await interaction.guild?.members.fetch(user.id)

        if (!member) return

        const perms = "`" + member.permissions.toArray().map(flag => flag.toLowerCase().replaceAll("_", " ")).join("`, `") + "`"

        const arrayTotalRoles = member.roles.cache
        const arrayRoles: string[] = []
        let nbRoles = 0
        arrayTotalRoles.forEach((role) => {
            if (role.name !== "@everyone") {
                arrayRoles.push(roleMention(role.id))
                nbRoles++
            }
        })
        const roles = arrayRoles.join(", ") + " (" + nbRoles + " " + t("role", { count: nbRoles }).toLowerCase() + ")"

        const nickname: string = member.nickname ?? t("nothing")

        const premiumSinceDate = member.premiumSince
        let premiumSince = ""
        if (premiumSinceDate) {
            const premiumSinceMonth = String(premiumSinceDate.getMonth() + 1).padStart(2, "0")
            const premiumSinceDay = String(premiumSinceDate.getDate()).padStart(2, "0")
            const premiumSinceYear = premiumSinceDate.getFullYear()
            const premiumSinceHour = String(premiumSinceDate.getHours()).padStart(2, "0")
            const premiumSinceMinutes = String(premiumSinceDate.getMinutes()).padStart(2, "0")
            const premiumSinceSeconds = String(premiumSinceDate.getSeconds()).padStart(2, "0")
            premiumSince = t("yes_since") + ` ${premiumSinceDay}/${premiumSinceMonth}/${premiumSinceYear} ${t("at")} ${premiumSinceHour}:${premiumSinceMinutes}:${premiumSinceSeconds}`
        }
        else {
            premiumSince = t("no_capitalized")
        }

        const color = await ColorThief.getColor(member.user.displayAvatarURL({ extension: "png" }))

        const informations = new EmbedBuilder()
            .setAuthor({ name: member.user.displayName, iconURL: member.user.displayAvatarURL() })
            .setColor(color)
            .addFields(
                { name: t("id"), value: member.id, inline: true },
                { name: t("nickname"), value: nickname, inline: true }
            )

        if (member.joinedAt) {
            informations.addFields({ name: t("join_date"), value: `${time(member.joinedAt)} (${time(member.joinedAt, "R")})` })
        }

        informations.addFields(
            { name: t("user_creation_date"), value: `${time(member.user.createdAt)} (${time(member.user.createdAt, "R")})` },
            { name: t("booster"), value: premiumSince, inline: true },
            { name: t("role", { count: nbRoles }), value: roles, inline: true },
            { name: t("permissions"), value: perms }
        )
            .setThumbnail(member.user.displayAvatarURL())
            .setFooter({ text: t("common:request_from", { username: interaction.user.username }), iconURL: interaction.user.displayAvatarURL() })

        interaction.reply({ embeds: [informations] })
    }
}