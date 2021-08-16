module.exports = {
    name: "invite",
    guildOnly: false,
    args: false,

    async execute(bot, msg) {
        const { MessageEmbed } = require("discord.js")
        const emb = new MessageEmbed()
            .addField(__("invite_bot") + " **" + bot.user.username + "** " + __("on_a_server"), __("the_link_to_invite_me_is_available") + " **" + __("here") + `(${process.env.INVITE_LINK})**`)
            .setColor("#DFC900")
            .setFooter(__("request_from") + msg.author.username, msg.author.avatarURL())
        msg.channel.send({ embeds: [emb] })
    }
}