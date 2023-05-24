const { SlashCommandBuilder } = require("@discordjs/builders")
const { MessageEmbed } = require("discord.js")
const t = require("i18next").t.bind(require("i18next"))

module.exports = {
    data: new SlashCommandBuilder()
        .setName("invite")
        .setDescription("Give you the link to invite me to a new Discord server"),
    guildOnly: false,

    async execute(bot, interaction) {
        const invite = new MessageEmbed()
            .addField(t("invite_bot") + " **" + bot.user.username + "** " + t("on_a_server"), t("the_link_to_invite_me_is_available") + " **" + t("here") + `(${process.env.INVITE_LINK})**`)
            .setColor("#DFC900")
            .setFooter({ text: t("common:request_from", { username: interaction.user.username }), iconURL: interaction.user.avatarURL() })

        interaction.reply({ embeds: [invite] })
    }
}