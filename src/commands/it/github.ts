import { SlashCommandBuilder, time } from "@discordjs/builders"
import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js"
import i18next from "i18next"
import dayjs from "dayjs"
// @ts-ignore: no types available for this package
import ColorThief from "colorthief"
import fetch from "node-fetch"
import { KirinoCommand, Kirino } from "../../lib/misc/types"
import { what } from "../../lib/misc/format"

const t = i18next.t.bind(i18next)

export const command: KirinoCommand = {
    builder: new SlashCommandBuilder()
        .setName("github")
        .setDescription("Display informations about a GitHub user")
        .addStringOption(option => option.setName("username").setDescription("The GitHub username of the user you want to get the profile").setRequired(true)),
    guildOnly: false,

    async execute(bot: Kirino, interaction: ChatInputCommandInteraction) {
        const username = interaction.options.getString("username")
        const apiCall = await fetch(`https://api.github.com/users/${username}`)
        const data = await apiCall.json()

        if (!data.message) {
            const creation = time(dayjs(data.created_at).unix())
            const creationRelative = time(dayjs(data.created_at).unix(), "R")

            let color

            try {
                color = await ColorThief.getColor(data.avatar_url) // can fail if GitHub is down, if the network has an issue BUT also if someone uses an animated gif as an avatar because the magic bytes are broken and ColorThief can't deal with that
            }
            catch {
                color = "#222222"
            }

            const profileEmbed = new EmbedBuilder()
                .setAuthor({ name: t("github_profile"), iconURL: "https://cdn.discordapp.com/attachments/714381484617891980/879280737780662272/github.png" })
                .setColor(color)
                .setThumbnail(data.avatar_url)
                .setURL(data.html_url)
                .setFooter({ text: `${t("common:request_from", { username: interaction.user.username })}`, iconURL: interaction.user.displayAvatarURL() })

            if (data.name) profileEmbed.setTitle(`**${data.name}** (${data.login})`)
            else profileEmbed.setTitle(`**${data.login}**`)
            if (data.blog) profileEmbed.addFields({ name: t("blog"), value: data.blog })
            if (data.company) profileEmbed.addFields({ name: t("company"), value: data.company, inline: true })
            if (data.location) profileEmbed.addFields({ name: t("location"), value: data.location, inline: true })
            if (data.email) profileEmbed.addFields({ name: t("email"), value: data.email })

            profileEmbed.addFields(
                { name: t("id"), value: data.id.toString(), inline: true },
                { name: t("public_repos"), value: `[${data.public_repos}](https://github.com/${data.login}?tab=repositories)`, inline: true },
                { name: t("public_gists"), value: data.public_gists.toString(), inline: true },
                { name: t("followers"), value: `[${data.followers}](https://github.com/${data.login}?tab=followers)`, inline: true },
                { name: t("following"), value: `[${data.following}](https://github.com/${data.login}?tab=following)`, inline: true },
                { name: t("account_creation_date"), value: `${creation} (${creationRelative})`, inline: true }
            )
            if (data.bio) profileEmbed.setDescription(data.bio)

            interaction.reply({ embeds: [profileEmbed] })
        }
        else {
            interaction.reply({ content: what(t("user_not_found")), ephemeral: true })
        }
    }
}