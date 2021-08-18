const { SlashCommandBuilder } = require("@discordjs/builders")
const { MessageEmbed } = require("discord.js")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("invite")
        .setDescription(__("description_invite")),
    guildOnly: false,

    async execute(bot, interaction) {
        const invite = new MessageEmbed()
            .addField(__("invite_bot") + " **" + bot.user.username + "** " + __("on_a_server"), __("the_link_to_invite_me_is_available") + " **" + __("here") + `(${process.env.INVITE_LINK})**`)
            .setColor("#DFC900")
            .setFooter(__("request_from") + interaction.user.username, interaction.user.avatarURL())

        interaction.reply({ embeds: [invite] })
    }
}