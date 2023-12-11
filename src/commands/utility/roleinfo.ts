import { SlashCommandBuilder, time } from "@discordjs/builders"
import { ChatInputCommandInteraction, EmbedBuilder, Role } from "discord.js"
import i18next from "i18next"
import { KirinoCommand, Kirino } from "../../lib/misc/types"

const t = i18next.t.bind(i18next)

export const command: KirinoCommand = {
    builder: new SlashCommandBuilder()
        .setName("roleinfo")
        .setDescription("Give you informations about a role")
        .addRoleOption(option => option.setName("role").setDescription("The role you want informations about").setRequired(true))
        .setDMPermission(false),

    async execute(bot: Kirino, interaction: ChatInputCommandInteraction) {
        const role = interaction.options.getRole("role") as Role

        const perms = "`" + role.permissions.toArray().map(flag => flag.toLowerCase().replaceAll("_", " ")).join("`, `") + "`"

        const informations = new EmbedBuilder()
            .setAuthor({ name: t("role") + " " + role.name })
            .setColor(role.hexColor)
            .addFields(
                { name: t("id"), value: role.id, inline: true },
                { name: t("color"), value: role.hexColor.toUpperCase(), inline: true },
                { name: t("mentionnable"), value: role.mentionable ? t("yes") : t("no"), inline: true },
                { name: t("separated_category"), value: role.hoist ? t("yes") : t("no"), inline: true },
                { name: t("position"), value: role.position.toString(), inline: true },
                { name: t("external_handler"), value: role.managed ? t("yes") : t("no"), inline: true },
                { name: t("role_creation_date"), value: `${time(role.createdAt)} (${time(role.createdAt, "R")})` },
                { name: t("permissions"), value: perms !== "``" ? perms : "`" + t("no_permissions") + "`" }
            )
            .setFooter({ text: t("common:request_from", { username: interaction.user.username }), iconURL: interaction.user.displayAvatarURL() })

        interaction.reply({ embeds: [informations] })
    }
}