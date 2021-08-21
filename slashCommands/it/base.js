const { SlashCommandBuilder } = require("@discordjs/builders")
const { MessageEmbed } = require("discord.js")
const t = require("i18next").t.bind(require("i18next"))

module.exports = {
    data: new SlashCommandBuilder()
        .setName("base")
        .setDescription("Perform a base (radix) conversion")
        .addStringOption(option => option.setName("number").setDescription("The number you want to convert").setRequired(true))
        .addIntegerOption(option => option.setName("current_base").setDescription("The current base of the number you want to convert").setRequired(true))
        .addIntegerOption(option => option.setName("new_base").setDescription("The base you want the number to be converted to").setRequired(true)),
    guildOnly: false,

    async execute(bot, interaction) {
        const number = interaction.options.getString("number")
        const inputBase = interaction.options.getInteger("current_base")
        const outputBase = interaction.options.getInteger("new_base")

        if (inputBase < 2 || inputBase > 36 || outputBase < 2 || outputBase > 36) {
            return interaction.reply({ content: t("base_out_of_range"), ephemeral: true })
        }

        const convertedToDecimal = parseInt(number, inputBase)
        if (isNaN(convertedToDecimal)) return interaction.reply({ content: t("bad_number"), ephemeral: true })

        const convertedToOutputBase = convertedToDecimal.toString(outputBase)

        const baseEmbed = new MessageEmbed()
            .setTitle(t("numeric_base_conversion"))
            .setThumbnail("https://cdn.discordapp.com/attachments/714381484617891980/720178440078229554/binary_flat.png")
            .setColor("#000000")
            .addField(`${t("original_number_in_base")} ${inputBase}`, `**${number}**`)
            .addField(`${t("converted_number_in_base")} ${outputBase}`, `**${convertedToOutputBase}**`)
            .setFooter(t("request_from") + interaction.user.username, interaction.user.displayAvatarURL())

        interaction.reply({ embeds : [baseEmbed] })
    }
}