import { SlashCommandBuilder } from "@discordjs/builders"
import { CommandInteraction, MessageEmbed } from "discord.js"
import i18next from "i18next"
// @ts-ignore
import { rustDocResearcher } from "../../lib/rustdoc/rustdoc_researcher"
import { Kirino } from "../../lib/misc/types"

const t = i18next.t.bind(i18next)

export default {
    data: new SlashCommandBuilder()
        .setName("rustdoc")
        .setDescription("Allow you to search through Rust's documentation and get the results")
        .addStringOption(option => option.setName("query").setDescription("The text you want to search in the documentation").setRequired(true)),
    guildOnly: false,
    cooldown: 3,

    async execute(bot: Kirino, interaction: CommandInteraction) {
        const query = interaction.options.getString("query")
        const results = rustDocResearcher(query)

        const content = []

        for (const category of [results.others, results.in_args, results.returned]) {
            let categoryContent = ""
            for (const result of category) {
                if (result === undefined) break

                let buffer = "- ["
                if (result.path !== "") buffer += result.path + "::"
                buffer += `**${result.name}**](${result.href})`
                if (result.desc !== "") buffer += " : " + result.desc.replaceAll("<code>", "`").replaceAll("</code>", "`")
                buffer += "\n"

                if (categoryContent.length + buffer.length <= 1024) categoryContent += buffer
                else break
            }
            content.push(categoryContent)
        }

        const embed = new MessageEmbed()
            .setTitle(t("results"))
            .setColor("#353535")
            .setThumbnail("https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Rust_programming_language_black_logo.svg/1024px-Rust_programming_language_black_logo.svg.png")
            .setFooter({ text: t("common:request_from", { username: interaction.user.username }), iconURL: interaction.user.displayAvatarURL() })

        if (content[0] !== "") embed.addFields({ name: t("in_name"), value: content[0] })
        if (content[1] !== "") embed.addFields({ name: t("in_settings"), value: content[1] })
        if (content[2] !== "") embed.addFields({ name: t("in_return_types"), value: content[2] })
        if (content[0] === "" && content[1] === "" && content[2] === "") embed.addFields({ name: t("no_result_title"), value: t("no_result") })

        interaction.reply({ embeds: [embed] })
    }
}