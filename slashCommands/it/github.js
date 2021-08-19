const { SlashCommandBuilder } = require("@discordjs/builders")
const { MessageEmbed } = require("discord.js")
const ColorThief = require("colorthief")
const fetch = require("node-fetch")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("github")
        .setDescription(__("description_github"))
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
                .setAuthor(__("github_profile"), "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png")
                .setColor(color)
                .setThumbnail(data.avatar_url)
                .setURL(data.html_url)
                .setFooter(`${__("request_from")}${interaction.user.username}`, interaction.user.displayAvatarURL())

            if (data.name) profileEmbed.setTitle(`**${data.name}** (${data.login})`)
            else profileEmbed.setTitle(`**${data.login}**`)
            if (data.blog) profileEmbed.addField(__("blog"), data.blog)
            if (data.company) profileEmbed.addField(__("company"), data.company, true)
            if (data.location) profileEmbed.addField(__("location"), data.location, true)
            if (data.email) profileEmbed.addField(__("email"), data.email)

            profileEmbed.addField(__("id"), data.id.toString(), true)
                .addField(__("public_repos"), `[${data.public_repos}](https://github.com/${data.login}?tab=repositories)`, true)
                .addField(__("public_gists"), data.public_gists.toString(), true)
                .addField(__("followers"), `[${data.followers}](https://github.com/${data.login}?tab=followers)`, true)
                .addField(__("following"), `[${data.following}](https://github.com/${data.login}?tab=following)`, true)
                .addField(__("account_creation_date"), `${creationDate} ${__("at")} ${creationTime}`, true)

            if (data.bio) profileEmbed.setDescription(data.bio)

            interaction.reply({ embeds: [profileEmbed] })
        }
        else {
            interaction.reply({ content: `${__("user_not_found")} ${__("kirino_what")}`, ephemeral: true })
        }
    }
}