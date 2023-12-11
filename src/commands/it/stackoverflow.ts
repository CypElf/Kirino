import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js"
import fetch from "node-fetch"
import { KirinoCommand, Kirino } from "../../lib/misc/types"
import { t } from "../../lib/misc/i18n"

type StackOverflowResponse = {
    items: {
        title: string
        link: string
        body_markdown: string,
        bo: string
    }[]
}

export const command: KirinoCommand = {
    builder: new SlashCommandBuilder()
        .setName("stackoverflow")
        .setDescription("Display the results of your search on stackoverflow")
        .addStringOption(option => option.setName("query").setDescription("What you want to search for on stackoverflow").setRequired(true)),

    async execute(bot: Kirino, interaction: ChatInputCommandInteraction) {
        const query = interaction.options.getString("query")
        const filter = "-(3ErjNFmyYQpKDo" // created with https://api.stackexchange.com/docs/create-filter

        const response = await fetch(`https://api.stackexchange.com/search/advanced?site=stackoverflow.com&sort=relevance&pagesize=5&q=${query}&filter=${filter}`)
        const { items } = await response.json() as StackOverflowResponse

        const results = items.length === 0 ? t("no_result") : items.map(item => `- **[${item.title}](${item.link})**\n${item.body_markdown.length > 100 ? item.body_markdown.slice(0, 97) + "..." : item.bo}`).join("\n\n")

        const stackoverflowEmbed = new EmbedBuilder()
            .setTitle(`${t("title", { query })}\n\u200b`)
            .setDescription(results)
            .setThumbnail("https://media.discordapp.net/attachments/714381484617891980/879634994715328522/stackoverflow.png")
            .setColor("#DB8A0F")
            .setFooter({ text: t("common:request_from", { username: interaction.user.username }), iconURL: interaction.user.displayAvatarURL() })

        interaction.reply({ embeds: [stackoverflowEmbed] })
    }
}