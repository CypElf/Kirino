module.exports = {
    name: "donation",
    guildOnly: false,
    args: false,
    aliases: ["don"],

    async execute(bot, msg) {
        const { MessageEmbed } = require("discord.js")
        const donationEmbed = new MessageEmbed()
            .addField(__("make_donation_title"), __("make_donation") + "(https://www.paypal.me/cypelf).")
            .setColor("#DFC900")
            .setThumbnail("https://cdn.discordapp.com/attachments/689424377770541071/699210423290953838/Logo.jpg")
            .setFooter(__("request_from") + msg.author.username, msg.author.displayAvatarURL())
        msg.channel.send({ embeds: [donationEmbed] })
    }
}