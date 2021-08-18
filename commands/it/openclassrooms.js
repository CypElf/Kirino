const { MessageEmbed } = require("discord.js")

module.exports = {
    name: "openclassrooms",
    guildOnly: false,
    args: false,
    aliases: ["oc"],

    async execute(bot, msg) {
        const linksEmbed = new MessageEmbed()
            .setTitle(__("careful_with_openclassrooms"))
            .setDescription(__("openclassrooms_explanation"))
            .setThumbnail("https://upload.wikimedia.org/wikipedia/fr/0/0d/Logo_OpenClassrooms.png")
            .setColor("#AA44FF")
            .setFooter(__("request_from") + msg.author.username, msg.author.displayAvatarURL())
        msg.channel.send({ embeds: [linksEmbed] })
    }
}