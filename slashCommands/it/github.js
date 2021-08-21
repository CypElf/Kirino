const { SlashCommandBuilder } = require("@discordjs/builders")
const { MessageEmbed } = require("discord.js")
const t = require("i18next").t.bind(require("i18next"))
const ColorThief = require("colorthief")
const fetch = require("node-fetch")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("github")
        .setDescription("Display informations about a GitHub user")
        .addStringOption(option => option.setName("username").setDescription("The GitHub username of the user you want to get the profile").setRequired(true)),
    guildOnly: false,
    cooldown: 3,

    async execute(bot, interaction) {
        const username = interaction.options.getString("username")
        const apiCall = await fetch(`https://api.github.com/users/${username}`)
        const data = await apiCall.json()

        if (!data.message) {
            const createdAt = data.created_at
            // github give us date as `YYYY-MM-DDTHH:MM:SSZ` with T and Z as letters
            const creationDate = createdAt.split("T")[0].split("-").reverse().join("/")
            const creationTime = createdAt.split("T")[1].split("Z")[0]

            const color = await ColorThief.getColor(data.avatar_url)

            const profileEmbed = new MessageEmbed()
                .setAuthor(t("github_profile"), "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png")
                .setColor(color)
                .setThumbnail(data.avatar_url)
                .setURL(data.html_url)
                .setFooter(`${t("request_from")}${interaction.user.username}`, interaction.user.displayAvatarURL())

            if (data.name) profileEmbed.setTitle(`**${data.name}** (${data.login})`)
            else profileEmbed.setTitle(`**${data.login}**`)
            if (data.blog) profileEmbed.addField(t("blog"), data.blog)
            if (data.company) profileEmbed.addField(t("company"), data.company, true)
            if (data.location) profileEmbed.addField(t("location"), data.location, true)
            if (data.email) profileEmbed.addField(t("email"), data.email)

            profileEmbed.addField(t("id"), data.id.toString(), true)
                .addField(t("public_repos"), `[${data.public_repos}](https://github.com/${data.login}?tab=repositories)`, true)
                .addField(t("public_gists"), data.public_gists.toString(), true)
                .addField(t("followers"), `[${data.followers}](https://github.com/${data.login}?tab=followers)`, true)
                .addField(t("following"), `[${data.following}](https://github.com/${data.login}?tab=following)`, true)
                .addField(t("account_creation_date"), `${creationDate} ${t("at")} ${creationTime}`, true)

            if (data.bio) profileEmbed.setDescription(data.bio)

            interaction.reply({ embeds: [profileEmbed] })
        }
        else {
            interaction.reply({ content: `${t("user_not_found")} ${t("common:kirino_what")}`, ephemeral: true })
        }
    }
}