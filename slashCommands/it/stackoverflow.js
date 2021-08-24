const { SlashCommandBuilder } = require("@discordjs/builders")
const { MessageEmbed } = require("discord.js")
const t = require("i18next").t.bind(require("i18next"))
const fetch = require("node-fetch")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("stackoverflow")
        .setDescription("Display the results of your search on stackoverflow")
        .addStringOption(option => option.setName("query").setDescription("What you want to search for on stackoverflow").setRequired(true)),
    guildOnly: false,
    cooldown: 1,

    async execute(bot, interaction) {
        const query = interaction.options.getString("query")
        const filter = "-(3ErjNFmyYQpKDo" // created with https://api.stackexchange.com/docs/create-filter

        const response = await fetch(`https://api.stackexchange.com/search/advanced?site=stackoverflow.com&sort=relevance&pagesize=5&q=${query}&filter=${filter}`)
        const { items } = await response.json()

        let results
        if (items.length === 0) results = "No result"
        else {
            results = items.map(item => `- **[${item.title}](${item.link})**\n${item.body_markdown.length > 100 ? item.body_markdown.slice(0, 97) + "..." : item.bo}`).join("\n\n")
        }

        const stackoverflowEmbed = new MessageEmbed()
            .setTitle(`Stackoverflow results for "${query}":\n\u200b`)
            .setDescription(results)
            .setThumbnail("https://media.discordapp.net/attachments/714381484617891980/879634994715328522/stackoverflow.png")
            .setColor("#DB8A0F")
            .setFooter(t("common:request_from", { username: interaction.user.username }), interaction.user.displayAvatarURL())

        interaction.reply({ embeds: [stackoverflowEmbed] })
    }
}