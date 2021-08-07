module.exports = {
	name: "codeblock",
    guildOnly: false,
	args: false,
    aliases: ["code"],

	async execute (bot, msg) {
        const { MessageEmbed } = require("discord.js")
        const linksEmbed = new MessageEmbed()
            .setTitle(__("send_code"))
            .setDescription(__("explanation_code"))
            .setThumbnail("https://cdn.discordapp.com/attachments/698105563485044748/712574232147656704/712320080884793537.png")
            .setImage("https://cdn.discordapp.com/attachments/698105563485044748/712577943666294814/unknown.png")
            .setColor("#000000")
            .setFooter(__("request_from") + msg.author.username, msg.author.displayAvatarURL())
		msg.channel.send({ embeds: [linksEmbed] })
	}
}