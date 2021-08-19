const { SlashCommandBuilder } = require("@discordjs/builders")
const { MessageEmbed } = require("discord.js")
const rustDocResearcher = require("../../lib/rustdoc/rustdoc_researcher")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("rustdoc")
        .setDescription(__("description_rustdoc"))
        .addStringOption(option => option.setName("query").setDescription("The text you want to search in the documentation").setRequired(true)),
    guildOnly: false,
    cooldown: 3,

    async execute(bot, interaction) {
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
            .setTitle(__("results"))
            .setColor("#353535")
            .setThumbnail("https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Rust_programming_language_black_logo.svg/1024px-Rust_programming_language_black_logo.svg.png")
            .setFooter(__("request_from") + interaction.user.username, interaction.user.displayAvatarURL())

        if (content[0] !== "") embed.addField(__("in_name"), content[0])
        if (content[1] !== "") embed.addField(__("in_settings"), content[1])
        if (content[2] !== "") embed.addField(__("in_return_types"), content[2])
        if (content[0] === "" && content[1] === "" && content[2] === "") embed.addField(__("no_result_title"), __("no_result"))

        interaction.reply({ embeds: [embed] })
    }
}