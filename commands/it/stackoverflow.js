const { MessageEmbed } = require("discord.js")
const fetch = require("node-fetch")

module.exports = {
    name: "stackoverflow",
    guildOnly: false,
    args: true,
    cooldown: 1,
    beta: true,

    async execute(bot, msg, args) {
        const query = args.join(" ")
        const filter = "-(3ErjNFmyYQpKDo" // created with https://api.stackexchange.com/docs/create-filter

        const response = await fetch(`https://api.stackexchange.com/search/advanced?site=stackoverflow.com&sort=relevance&pagesize=5&q=${query}&filter=${filter}`)
        const { items } = await response.json()

        const results = items.length === 0 ? __("no_result_stackoverflow") : items.map(item => `- **[${item.title}](${item.link})**\n${item.body_markdown.length > 100 ? item.body_markdown.slice(0, 97) + "..." : item.bo}`).join("\n\n")

        const stackoverflowEmbed = new MessageEmbed()
            .setTitle(`${__("title_stackoverflow")} "${query}":\n\u200b`)
            .setDescription(results)
            .setThumbnail("https://media.discordapp.net/attachments/714381484617891980/879634994715328522/stackoverflow.png")
            .setColor("#DB8A0F")
            .setFooter(__("request_from", { username: msg.author.username }), msg.author.displayAvatarURL())

        msg.channel.send({ embeds: [stackoverflowEmbed] })
    }
}