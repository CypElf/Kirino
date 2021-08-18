const { SlashCommandBuilder } = require("@discordjs/builders")
const { MessageEmbed } = require("discord.js")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("donation")
        .setDescription(__("description_donation")),
    guildOnly: false,

    async execute(bot, interaction) {
        const donationEmbed = new MessageEmbed()
            .addField(__("make_donation_title"), __("make_donation") + "(https://www.paypal.me/cypelf).")
            .setColor("#DFC900")
            .setThumbnail("https://cdn.discordapp.com/attachments/689424377770541071/699210423290953838/Logo.jpg")
            .setFooter(__("request_from") + interaction.user.username, interaction.user.displayAvatarURL())
        
        interaction.reply({ embeds: [donationEmbed] })
    }
}