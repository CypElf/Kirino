const { SlashCommandBuilder } = require("@discordjs/builders")
const { MessageEmbed } = require("discord.js")
const t = require("i18next").t.bind(require("i18next"))

module.exports = {
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Give you some ways to get help if you need it"),
    guildOnly: false,

    async execute(bot, interaction) {
        const helpEmbed = new MessageEmbed()
            .setTitle("**Help**")
            .setThumbnail("https://media.discordapp.net/attachments/714381484617891980/878930768959799326/help.png")
            .addField("**Q & A**\n​", "**\"How to use the command [insert command name]?\"**\n\nCheck its description and parameters descriptions in the slash commands, everything is explained here.\n\n**\"I found a bug or encountered a problem!\"**\n\nIt usually gets instantly logged then fixed shortly after that, but don't hesitate to use the `report` command to submit it to be sure it'll be treated.\n\n**\"I want to be informed of the changes Kirino receives.\"**\n\nJust join the [support server](https://discord.gg/NNAGZCz) and read the <#742723228983885887> channel. You can also follow it to consult the messages in another server.\n\n**\"I need to discuss with you about something related to this bot, so a report isn't adapted.\"**\n\nJoin the [support server](https://discord.gg/NNAGZCz) and you should be able to DM me, but consider making a report instead if it applies to the situation, as it's easier for me to track.")
            .setColor("#DFC900")
            .setFooter(t("common:request_from", { username: interaction.user.username }), interaction.user.displayAvatarURL())

        interaction.reply({ embeds: [helpEmbed] })
    }
}