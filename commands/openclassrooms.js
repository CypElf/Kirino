module.exports = {
	name: "openclassrooms",
    description: "description_openclassrooms",
    guildOnly: false,
	args: false,
    category: "programming",
    aliases: ["oc"],

	async execute (bot, msg) {
        const Discord = require("discord.js")
        let linksEmbed = new Discord.MessageEmbed()
            .setTitle(__("careful_with_openclassrooms"))
            .setDescription(__("openclassrooms_explanation"))
			.setThumbnail("https://upload.wikimedia.org/wikipedia/fr/0/0d/Logo_OpenClassrooms.png")
            .setColor("#AA44FF")
		msg.channel.send(linksEmbed)
	}
}